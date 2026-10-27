import { wasm, worker } from "virtual:duckdb-assets";
import * as duckdb from "@duckdb/duckdb-wasm";

export type Column = { name: string; type: string };
export type Sort = { column: string; desc: boolean };
export type TableQuery = { search: string; filters: Record<string, string>; sort?: Sort };

const TABLE = "dataset";
const SOURCE = "source.csv";
/** Larger files (or files that do not fit in memory) are streamed from disk on each query. */
const IN_MEMORY_LIMIT = 1024 ** 3;

const ident = (name: string) => `"${name.replaceAll('"', '""')}"`;
const literal = (value: string) => `'${value.replaceAll("'", "''")}'`;

async function inflate(base64: string, type: string) {
  const res = await fetch(`data:;base64,${base64}`);
  const body = (res.body as ReadableStream).pipeThrough(new DecompressionStream("gzip"));
  return new Blob([await new Response(body).blob()], { type });
}

const toDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

async function init() {
  const [workerBlob, wasmBlob] = await Promise.all([
    inflate(worker, "text/javascript"),
    inflate(wasm, "application/wasm"),
  ]);
  const db = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), new Worker(URL.createObjectURL(workerBlob)));
  // Workers started from a file:// page cannot fetch blob: URLs, so the wasm goes in as a data: URL.
  await db.instantiate(await toDataUrl(wasmBlob));
  return { db, conn: await db.connect() };
}

let instance: ReturnType<typeof init> | undefined;
const getDb = () => {
  instance ??= init();
  return instance;
};

async function query(sql: string): Promise<string[][]> {
  const { conn } = await getDb();
  const table = await conn.query(sql);
  const columns = table.schema.fields.map((_, i) => table.getChildAt(i));
  return Array.from({ length: table.numRows }, (_, row) => columns.map((c) => String(c?.get(row) ?? "")));
}

let loadedKind: "TABLE" | "VIEW" | undefined;

export async function loadCsvSource(file: Blob): Promise<Column[]> {
  const { db } = await getDb();
  if (loadedKind) await query(`DROP ${loadedKind} ${TABLE}`);
  loadedKind = undefined;
  await db.dropFile(SOURCE);
  await db.registerFileHandle(SOURCE, file, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
  const create = (kind: typeof loadedKind) =>
    query(`CREATE ${kind} ${TABLE} AS SELECT * FROM read_csv(${literal(SOURCE)}, null_padding = true)`).then(() => {
      loadedKind = kind;
    });
  await (file.size > IN_MEMORY_LIMIT ? create("VIEW") : create("TABLE").catch(() => create("VIEW")));
  const described = await query(`DESCRIBE ${TABLE}`);
  return described.map(([name = "", type = ""]) => ({ name, type }));
}

const text = (column: string) => `lower(t.${ident(column)}::VARCHAR)`;

function where(columns: Column[], { search, filters }: TableQuery) {
  const conditions = Object.entries(filters)
    .filter(([, value]) => value.trim())
    .map(([column, value]) => `contains(${text(column)}, ${literal(value.trim().toLowerCase())})`);
  const term = search.trim().toLowerCase();
  if (term) conditions.push(`(${columns.map((c) => `contains(${text(c.name)}, ${literal(term)})`).join(" OR ")})`);
  return conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
}

/** `safe` prefixes text cells that spreadsheet apps would run as formulas (CSV injection). */
export function selectSql(columns: Column[], q: TableQuery, { safe = false, total = false } = {}) {
  const cell = ({ name, type }: Column) => {
    const value = `t.${ident(name)}::VARCHAR`;
    const escaped = `CASE WHEN regexp_matches(${value}, '^[=+\\-@\\t\\r]') THEN '''' || ${value} ELSE ${value} END`;
    return `${safe && type === "VARCHAR" ? escaped : value} AS ${ident(name)}`;
  };
  const order = q.sort ? ` ORDER BY t.${ident(q.sort.column)} ${q.sort.desc ? "DESC" : "ASC"} NULLS LAST` : "";
  const fields = [...columns.map(cell), ...(total ? ["count(*) OVER ()"] : [])];
  return `SELECT ${fields.join(", ")} FROM ${TABLE} t${where(columns, q)}${order}`;
}

export const queryRows = (columns: Column[], q: TableQuery, limit: number, safe = false) =>
  query(`${selectSql(columns, q, { safe })} LIMIT ${limit}`);

/** One scan returns both the page and the filtered row count. */
export async function queryPage(columns: Column[], q: TableQuery, limit: number, offset: number) {
  const rows = await query(`${selectSql(columns, q, { total: true })} LIMIT ${limit} OFFSET ${offset}`);
  return { rows: rows.map((row) => row.slice(0, -1)), total: Number(rows[0]?.at(-1) ?? 0) };
}

export async function copyToBuffer(sql: string, options: string) {
  const { db } = await getDb();
  const file = "export.out";
  await query(`COPY (${sql}) TO ${literal(file)} (${options})`);
  const buffer = await db.copyFileToBuffer(file);
  await db.dropFile(file);
  return buffer;
}
