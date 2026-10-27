import { CopyIcon, FileDownIcon, Loader2Icon, SearchIcon, SheetIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExcelTable } from "@/components/excel-table";
import { FileInput } from "@/components/file-input";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportCsv, exportTsv, loadCsv } from "@/lib/csv";
import { type Column, queryPage, type Sort, type TableQuery } from "@/lib/duckdb";
import { baseName, downloadBlob, formatNumber, useDebounce } from "@/lib/utils";
import { exportXlsx, listSheets, loadXlsx, XLSX_MAX_ROWS } from "@/lib/xlsx";

const COPY_MAX_ROWS = 100_000;
const isXlsx = (file: File) => /\.xlsx$/i.test(file.name);

export function ExcelViewer() {
  const [file, setFile] = useState<File>();
  const [sheets, setSheets] = useState<string[]>([]);
  const [sheet, setSheet] = useState<string>();
  const [columns, setColumns] = useState<Column[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<Sort>();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [result, setResult] = useState({ rows: [] as string[][], total: 0 });
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string>();

  const debouncedSearch = useDebounce(search);
  const debouncedFilters = useDebounce(filters);
  const query: TableQuery = { search: debouncedSearch, filters: debouncedFilters, sort };

  // biome-ignore lint/correctness/useExhaustiveDependencies: `query` is derived from the listed values
  useEffect(() => {
    if (!columns.length) return;
    let stale = false;
    setLoading(true);
    queryPage(columns, query, pageSize, page * pageSize)
      .then((next) => !stale && setResult(next))
      .catch((e) => toast.error(String(e)))
      .finally(() => !stale && setLoading(false));
    return () => {
      stale = true;
    };
  }, [columns, debouncedSearch, debouncedFilters, sort, page, pageSize]);

  const resetPage =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      setPage(0);
    };

  const run = async (label: string, task: () => Promise<unknown>) => {
    setBusy(label);
    try {
      await task();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(undefined);
    }
  };

  const load = async (next: File, nextSheet?: string) => {
    setFilters({});
    setSort(undefined);
    setSearch("");
    setPage(0);
    setColumns(nextSheet ? await loadXlsx(next, nextSheet) : await loadCsv(next));
    setFile(next);
    setSheet(nextSheet);
  };

  const onFile = (next: File) =>
    run("Loading", async () => {
      const names = isXlsx(next) ? await listSheets(next) : [];
      setSheets(names);
      await load(next, names[0]);
    });

  const reset = () => {
    setFile(undefined);
    setColumns([]);
    setSheets([]);
    setResult({ rows: [], total: 0 });
  };

  const name = file ? baseName(file.name) : "export";
  const actions = [
    {
      label: "Copy",
      icon: CopyIcon,
      task: async () => {
        await navigator.clipboard.writeText(await exportTsv(columns, query, COPY_MAX_ROWS));
        const copied = Math.min(result.total, COPY_MAX_ROWS);
        toast.success(`Copied ${formatNumber(copied)} rows${copied < result.total ? " (limit reached)" : ""}`);
      },
    },
    {
      label: "CSV",
      icon: FileDownIcon,
      task: async () => downloadBlob(await exportCsv(columns, query), `${name}.csv`),
    },
    {
      label: "XLSX",
      icon: SheetIcon,
      task: async () => {
        downloadBlob(await exportXlsx(columns, query), `${name}.xlsx`);
        if (result.total > XLSX_MAX_ROWS) toast.warning("Excel is limited to 1,048,575 rows, use CSV for the rest.");
      },
    },
  ];

  if (!file) {
    return (
      <div className="space-y-4">
        <FileInput
          accept=".csv,.tsv,.txt,.xlsx"
          disabled={!!busy}
          onFile={onFile}
          hint="CSV, TSV or XLSX. Everything stays on your computer."
        />
        {busy && (
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Loader2Icon className="size-4 animate-spin" /> Loading…
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="truncate text-lg font-semibold">{file.name}</h2>
        <Badge variant="secondary">{columns.length} columns</Badge>
        {sheets.length > 1 && (
          <Select value={sheet} onValueChange={(value) => value && run("Loading", () => load(file, value))}>
            <SelectTrigger aria-label="Sheet">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sheets.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button variant="ghost" size="icon" className="ml-auto" onClick={reset} aria-label="Close file">
          <XIcon />
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-4 size-5 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => resetPage(setSearch)(e.target.value)}
            placeholder="Search in all columns…"
            className="h-12 pl-12 text-base md:text-base"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {actions.map(({ label, icon: Icon, task }) => (
            <Button key={label} size="lg" variant="outline" disabled={!!busy} onClick={() => run(label, task)}>
              {busy === label ? <Loader2Icon className="animate-spin" /> : <Icon />}
              {label}
            </Button>
          ))}
        </div>
      </div>

      <ExcelTable
        columns={columns}
        rows={result.rows}
        sort={sort}
        onSortChange={resetPage(setSort)}
        filters={filters}
        onFilterChange={(column, value) => resetPage(setFilters)({ ...filters, [column]: value })}
        loading={loading || busy === "Loading"}
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={result.total}
        onPageChange={setPage}
        onPageSizeChange={resetPage(setPageSize)}
      />
    </div>
  );
}
