import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber } from "@/lib/utils";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const SIZES = [25, 50, 100, 250];

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total ? page * pageSize + 1 : 0;
  const to = Math.min(total, (page + 1) * pageSize);

  const buttons = [
    { label: "First page", icon: ChevronsLeftIcon, target: 0, disabled: page === 0 },
    { label: "Previous page", icon: ChevronLeftIcon, target: page - 1, disabled: page === 0 },
    { label: "Next page", icon: ChevronRightIcon, target: page + 1, disabled: page >= pages - 1 },
    { label: "Last page", icon: ChevronsRightIcon, target: pages - 1, disabled: page >= pages - 1 },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-muted-foreground text-sm">
        {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)} rows
      </p>
      <div className="flex items-center gap-2">
        <Select value={pageSize} onValueChange={(value) => value && onPageSizeChange(value)}>
          <SelectTrigger aria-label="Rows per page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SIZES.map((size) => (
              <SelectItem key={size} value={size}>
                {size} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="px-2 text-sm">
          {formatNumber(page + 1)} / {formatNumber(pages)}
        </span>
        {buttons.map(({ label, icon: Icon, target, disabled }) => (
          <Button
            key={label}
            variant="outline"
            size="icon-lg"
            aria-label={label}
            disabled={disabled}
            onClick={() => onPageChange(target)}
          >
            <Icon />
          </Button>
        ))}
      </div>
    </div>
  );
}
