import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeadCell } from "./Table";
import { Loading } from "./Loading";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T, idx: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data found."
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="border border-[#E4E6DF] rounded-lg bg-white/20 p-12 flex justify-center">
        <Loading text="Retrieving records..." />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border border-[#E4E6DF] rounded-lg bg-white/20 py-16 text-center text-[#90998C]">
        <div className="text-sm font-medium">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHeadCell key={col.key} className={col.className}>
              {col.label}
            </TableHeadCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, idx) => (
          <TableRow key={idx}>
            {columns.map((col) => (
              <TableCell key={col.key} className={col.className}>
                {col.render ? col.render(item, idx) : (item as any)[col.key] || "-"}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
