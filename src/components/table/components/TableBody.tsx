import { flexRender, type Table } from "@tanstack/react-table";
import { TableBodyBase, TableCellBase, TableRowBase } from "./TableParts";

type TableBodyProps<TData> = {
  table: Table<TData>;
};

export const TableBody = <TableData,>({ table }: TableBodyProps<TableData>) => {
  return (
    <TableBodyBase>
      {table.getRowModel().rows.map((row) => (
        <TableRowBase key={row.id} className="min-w-fit w-full">
          {row.getVisibleCells().map((cell) => (
            <TableCellBase
              key={cell.id}
              style={{
                width: cell.column.getSize(),
              }}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCellBase>
          ))}
        </TableRowBase>
      ))}
    </TableBodyBase>
  );
};