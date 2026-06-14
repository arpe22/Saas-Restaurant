"use client";

import {
  Building2,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  MapPin,
  Package,
  ShieldCheck,
  Store,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard"
  },
  {
    href: "/restaurants",
    icon: Store,
    label: "Restaurantes"
  },
  {
    href: "/branches",
    icon: MapPin,
    label: "Sucursales"
  },
  {
    href: "/users",
    icon: Users,
    label: "Usuarios",
    permissions: ["users.manage"]
  },
  {
    href: "/roles",
    icon: ShieldCheck,
    label: "Roles",
    permissions: ["roles.manage"]
  },
  {
    href: "/permissions",
    icon: ClipboardList,
    label: "Permisos",
    permissions: ["roles.manage"]
  },
  {
    href: "/menu/categories",
    icon: FolderTree,
    label: "Categorias",
    permissions: ["menu.view"]
  },
  {
    href: "/menu/products",
    icon: Package,
    label: "Productos",
    permissions: ["menu.view"]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { hasAnyPermission } = useAuth();

  const visibleItems = navItems.filter((item) =>
    item.permissions ? hasAnyPermission(item.permissions) : true
  );

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-line bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-line px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand text-white">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-ink">Restaurant SaaS</p>
          <p className="text-xs text-muted">Admin</p>
        </div>
      </div>
      <nav className="grid gap-1 p-3">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              className={cn(
                "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-muted transition hover:bg-slate-100 hover:text-ink",
                active && "bg-emerald-50 text-brand"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
