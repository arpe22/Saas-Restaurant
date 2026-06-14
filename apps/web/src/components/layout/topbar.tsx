"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { getInitials } from "@/lib/utils";

export function Topbar() {
  const router = useRouter();
  const { logout, user } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-white px-6">
      <div>
        <p className="text-xs font-semibold uppercase text-muted">Panel</p>
        <h1 className="text-lg font-bold text-ink">Administracion</h1>
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3 rounded-md border border-line bg-slate-50 px-3 py-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
              {getInitials(user.email)}
            </span>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-ink">{user.email}</p>
              <p className="text-xs text-muted">{user.roles.join(", ") || "Sin rol"}</p>
            </div>
          </div>
        ) : null}
        <Button onClick={handleLogout} type="button" variant="secondary">
          <LogOut className="h-4 w-4" />
          Salir
        </Button>
      </div>
    </header>
  );
}
