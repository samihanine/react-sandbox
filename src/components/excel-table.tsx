import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Column, Sort } from "@/lib/duckdb";
import { cn } from "@/lib/utils";

type ExcelTableProps = {
  columns: Column[];
  rows: string[][];
  sort?: Sort;
  onSortChange: (sort?: Sort) => void;
  filters: Record<string, string>;
  onFilterChange: (column: string, value: string) => void;
  loading?: boolean;
};

const nextSort = (column: string, sort?: Sort): Sort | undefined => {
  if (sort?.column !== column) return { column, desc: false };
  return sort.desc ? undefined : { column, desc: true };
};

function SortIcon({ active, desc }: { active: boolean; desc?: boolean }) {
  if (!active) return <ArrowUpDownIcon className="size-3.5 opacity-40" />;
  return desc ? <ArrowDownIcon className="size-3.5" /> : <ArrowUpIcon className="size-3.5" />;
}

export function ExcelTable({ columns, rows, sort, onSortChange, filters, onFilterChange, loading }: ExcelTableProps) {
  return (
    <div className={cn("rounded-xl border transition-opacity", loading && "opacity-60")}>
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {columns.map(({ name, type }) => (
              <TableHead key={name} className="h-auto py-2">
                <button
                  type="button"
                  onClick={() => onSortChange(nextSort(name, sort))}
                  className="flex w-full items-center gap-2 text-left font-semibold"
                >
                  <span className="truncate">{name}</span>
                  <SortIcon active={sort?.column === name} desc={sort?.desc} />
                </button>
                <span className="text-muted-foreground text-xs font-normal">{type}</span>
              </TableHead>
            ))}
          </TableRow>
          <TableRow className="hover:bg-transparent">
            {columns.map(({ name }) => (
              <TableHead key={name} className="pb-2">
                <Input
                  value={filters[name] ?? ""}
                  onChange={(e) => onFilterChange(name, e.target.value)}
                  placeholder="Filter…"
                  aria-label={`Filter ${name}`}
                  className="bg-background min-w-28 font-normal"
                />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: rows have no stable id
            <TableRow key={i}>
              {row.map((cell, j) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: cells are positional
                <TableCell key={j} title={cell} className="max-w-xs truncate">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center">
                No results
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
