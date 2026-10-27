import { unzipSync } from "fflate";
import { readSheet } from "read-excel-file/browser";
import writeXlsxFile from "write-excel-file/browser";
import { toDelimited } from "@/lib/csv";
import { type Column, loadCsvSource, queryRows, type TableQuery } from "@/lib/duckdb";

export const XLSX_MAX_ROWS = 1_048_575;
const CHUNK = 50_000;

/** Reads sheet names from the workbook manifest without parsing any sheet. */
export async function listSheets(file: File) {
  const files = unzipSync(new Uint8Array(await file.arrayBuffer()), {
    filter: (entry) => entry.name === "xl/workbook.xml",
  });
  const xml = new TextDecoder().decode(files["xl/workbook.xml"]);
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  return Array.from(doc.getElementsByTagName("sheet"), (sheet) => sheet.getAttribute("name") ?? "");
}

export async function loadXlsx(file: File, sheet: string) {
  const [header = [], ...rows] = await readSheet(file, sheet);
  const names = header.map((cell, i) => String(cell ?? "").trim() || `column_${i + 1}`);
  const parts = [toDelimited([names])];
  for (let i = 0; i < rows.length; i += CHUNK) parts.push(`\r\n${toDelimited(rows.slice(i, i + CHUNK))}`);
  return loadCsvSource(new Blob(parts, { type: "text/csv" }));
}

export async function exportXlsx(columns: Column[], q: TableQuery) {
  const rows = await queryRows(columns, q, XLSX_MAX_ROWS);
  const header = columns.map((c) => ({ value: c.name, fontWeight: "bold" as const }));
  return writeXlsxFile([header, ...rows]).toBlob();
}
