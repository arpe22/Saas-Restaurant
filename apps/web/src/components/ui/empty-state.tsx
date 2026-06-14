import { ReactNode } from "react";

export function EmptyState({
  action,
  title = "Sin registros"
}: {
  action?: ReactNode;
  title?: string;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line bg-white p-6 text-center">
      <p className="text-sm font-semibold text-ink">{title}</p>
      {action}
    </div>
  );
}
