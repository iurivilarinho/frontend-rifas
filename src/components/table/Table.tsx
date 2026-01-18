import { useContainerWidth } from "@/hooks/useContainerWidth";
import {
  type ColumnDef,
  type ColumnSizingState,
  type Table,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { getInitialColumnSizing } from "./utils/cols";

type TableProps<T> = {
  data: T[];
  columns: ColumnDef<T, any>[];
  tableId: string;
  children: ReactNode;
  fillContainerWidth?: boolean;
};

interface TableContextType {
  table: Table<any>;
}

const TableContext = createContext<TableContextType | null>(null);

export const TableRoot = <T,>({
  data,
  columns,
  tableId,
  children,
  fillContainerWidth = false,
}: TableProps<T>) => {
  const { ref, width } = useContainerWidth<HTMLDivElement>();

  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  useEffect(() => {
    if (!fillContainerWidth) return;

    if (width && Object.keys(columnSizing).length === 0) {
      setColumnSizing(getInitialColumnSizing(columns, width));
    }
  }, [width, columns, fillContainerWidth]);

  const table = useReactTable({
    data,
    columns,
    columnResizeMode: "onChange",
    columnResizeDirection: "ltr",
    state: { columnSizing },
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  return (
    <TableContext.Provider value={{ table }}>
      <div
        ref={ref}
        id={tableId}
        className="overflow-x-auto w-full max-w-full border-y border-border mx-auto"
      >
        {children}
      </div>
    </TableContext.Provider>
  );
};

export const useTable = () => {
  const context = useContext(TableContext);
  if (!context) throw new Error("useTable deve ser usado dentro de um Table");
  return context;
};
