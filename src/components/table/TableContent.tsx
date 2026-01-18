import { useEffect, useRef } from "react";
import { useTable } from "./Table";
import { TableBody } from "./components/TableBody";
import { type Sorting, TableHeader } from "./components/TableHeader";
import { TableBase } from "./components/TableParts";
import { stretchColumns } from "./utils/cols";

type TableHeaderProps<TData> = {
  sorting?: Sorting<TData>[];
  onSortChange?: (sorting: Sorting<TData>[]) => void;
  stickyHeader?: boolean;
};

export const TableContent = <TData,>({
  sorting,
  onSortChange,
  stickyHeader,
}: TableHeaderProps<TData>) => {
  const { table } = useTable();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (ref.current) {
        const width = ref.current.offsetWidth;
        stretchColumns(table, width);
      }
    });

    resizeObserver.observe(ref.current);

    return () => resizeObserver.disconnect();
  }, [table]);

  return (
    <TableBase className="w-full">
      <TableHeader
        table={table}
        sorting={sorting}
        onSortChange={onSortChange}
        isSticky={stickyHeader}
      />
      <TableBody table={table} />
    </TableBase>
  );
};
