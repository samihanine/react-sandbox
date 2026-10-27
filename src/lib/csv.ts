import { type Column, copyToBuffer, loadCsvSource, queryRows, selectSql, type TableQuery } from "@/lib/duckdb";

const formatDate = (date: Date) => {
  const iso = date.toISOString();
  return iso.endsWith("T00:00:00.000Z") ? iso.slice(0, 10) : iso;
};

const escapeCell = (value: unknown, separator: string) => {
  const text = value instanceof Date ? formatDate(value) : String(value ?? "");
  return /["\r\n]/.test(text) || text.includes(separator) ? `"${text.replaceAll('"', '""')}"` : text;
};

export const toDelimited = (rows: unknown[][], separator = ",") =>
  rows.map((row) => row.map((cell) => escapeCell(cell, separator)).join(separator)).join("\r\n");

export const loadCsv = (file: File) => loadCsvSource(file);

export async function exportCsv(columns: Column[], q: TableQuery) {
  const buffer = await copyToBuffer(selectSql(columns, q, { safe: true }), "HEADER, DELIMITER ','");
  return new Blob([buffer as BlobPart], { type: "text/csv" });
}

/** Tab-separated text, pastes straight into Excel or Google Sheets. */
export async function exportTsv(columns: Column[], q: TableQuery, limit: number) {
  const rows = await queryRows(columns, q, limit, true);
  return toDelimited([columns.map((c) => c.name), ...rows], "\t");
}
