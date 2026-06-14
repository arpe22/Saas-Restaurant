"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { categoriesService } from "@/services/categories.service";
import { productsService } from "@/services/products.service";
import { restaurantsService } from "@/services/restaurants.service";
import { rolesService } from "@/services/roles.service";
import { usersService } from "@/services/users.service";

const quickLinks = [
  { href: "/restaurants", label: "Restaurantes" },
  { href: "/branches", label: "Sucursales" },
  { href: "/users", label: "Usuarios", permission: "users.manage" },
  { href: "/roles", label: "Roles", permission: "roles.manage" },
  { href: "/menu/categories", label: "Categorias", permission: "menu.view" },
  { href: "/menu/products", label: "Productos", permission: "menu.view" }
];

export default function DashboardPage() {
  const { hasPermission, user } = useAuth();

  const restaurantsQuery = useQuery({
    queryFn: restaurantsService.list,
    queryKey: ["restaurants"]
  });
  const usersQuery = useQuery({
    enabled: hasPermission("users.manage"),
    queryFn: usersService.list,
    queryKey: ["users"]
  });
  const rolesQuery = useQuery({
    enabled: hasPermission("roles.manage"),
    queryFn: rolesService.list,
    queryKey: ["roles"]
  });
  const categoriesQuery = useQuery({
    enabled: hasPermission("menu.view"),
    queryFn: categoriesService.list,
    queryKey: ["categories"]
  });
  const productsQuery = useQuery({
    enabled: hasPermission("menu.view"),
    queryFn: productsService.list,
    queryKey: ["products"]
  });

  const cards = [
    { label: "Restaurantes visibles", value: restaurantsQuery.data?.length },
    { label: "Usuarios", value: usersQuery.data?.length, permission: "users.manage" },
    { label: "Roles", value: rolesQuery.data?.length, permission: "roles.manage" },
    { label: "Categorias", value: categoriesQuery.data?.length, permission: "menu.view" },
    { label: "Productos", value: productsQuery.data?.length, permission: "menu.view" }
  ].filter((item) => !item.permission || hasPermission(item.permission));

  return (
    <AppLayout>
      <PageHeader
        description="Vista rapida para probar los modulos disponibles del backend actual."
        title="Dashboard"
      />

      <div className="mb-6 rounded-lg border border-line bg-white p-5">
        <p className="text-sm text-muted">Bienvenido</p>
        <h3 className="mt-1 text-xl font-bold text-ink">{user?.email}</h3>
        <p className="mt-2 text-sm text-muted">
          Restaurante actual: <span className="font-semibold">{user?.restaurantId}</span>
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label}>
            <p className="text-sm text-muted">{card.label}</p>
            {card.value === undefined ? (
              <LoadingState label="Cargando" />
            ) : (
              <p className="mt-2 text-3xl font-bold text-ink">{card.value}</p>
            )}
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="mb-4 text-lg font-bold text-ink">Accesos rapidos</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks
            .filter((link) => !link.permission || hasPermission(link.permission))
            .map((link) => (
              <Link
                className="rounded-md border border-line px-4 py-3 text-sm font-semibold text-ink transition hover:border-brand hover:text-brand"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
        </div>
      </Card>
    </AppLayout>
  );
}
