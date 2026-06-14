import { ReactNode } from "react";

export function PageHeader({
  actions,
  description,
  title
}: {
  actions?: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-ink">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}
