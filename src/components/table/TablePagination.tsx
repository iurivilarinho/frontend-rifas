import { mergeClasses } from "@/lib/mergeClasses";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "../button/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../input/Select";

export type Pagination = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

type TablePaginationProps = {
  pagination: Partial<Pagination>;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isSticky?: boolean;
};

export const TablePagination = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  isSticky = true,
}: TablePaginationProps) => {
  const {
    page = 0,
    size = 0,
    totalElements = 0,
    totalPages = 0,
    first,
    last,
  } = pagination || {};

  const start = totalElements === 0 ? 0 : (page - 1) * size + 1;
  const end = Math.min(page * size, totalElements);

  return (
    <div
      className={mergeClasses(
        "flex w-full flex-col gap-2 border-t border-border bg-card px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-2.5",
        isSticky && "sticky bottom-0 left-0",
      )}
    >
      {/* Linha 1 (mobile) / esquerda (desktop): range + page size */}
      <div className="flex items-center justify-between gap-3 sm:justify-start">
        <span className="text-xs text-muted-foreground sm:text-sm">
          {start}–{end} de {totalElements}
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-xs sm:text-sm">
            <span className="hidden sm:inline text-muted-foreground">
              Linhas:
            </span>
            <Select
              value={String(size)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[64px]">
                <SelectValue>{size}</SelectValue>
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 50].map((s) => (
                  <SelectItem
                    key={s}
                    value={String(s)}
                    className="hover:cursor-pointer"
                  >
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Linha 2 (mobile) / direita (desktop): navegação */}
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => onPageChange(1)}
            disabled={first}
            aria-label="Primeira página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={first}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <span className="text-xs text-foreground sm:text-sm">
          <span className="sm:hidden">{page}/{totalPages || 1}</span>
          <span className="hidden sm:inline">
            Página {page} de {totalPages || 1}
          </span>
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={last}
            aria-label="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => onPageChange(totalPages)}
            disabled={last}
            aria-label="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
