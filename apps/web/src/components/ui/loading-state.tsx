import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingState({
  fullPage = false,
  label = "Cargando"
}: {
  fullPage?: boolean;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 text-sm text-muted",
        fullPage ? "min-h-screen" : "min-h-40"
      )}
    >
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}
