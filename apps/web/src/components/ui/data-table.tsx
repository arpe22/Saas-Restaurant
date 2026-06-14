import { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";

export type Column<T> = {
  header: string;
  cell: (row: T) => ReactNode;
};

export function DataTable<T>({
  columns,
  data,
  emptyTitle = "Sin registros",
  getRowId
}: {
  columns: Column<T>[];
  data: T[];
  emptyTitle?: string;
  getRowId: (row: T) => string;
}) {
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-white">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-muted">
          <tr>
            {columns.map((column) => (
              <th className="border-b border-line px-4 py-3" key={column.header}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr className="border-b border-line last:border-0" key={getRowId(row)}>
              {columns.map((column) => (
                <td className="px-4 py-3 align-middle" key={column.header}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
