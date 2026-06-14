"use client";

import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { LoadingState } from "@/components/ui/loading-state";
import { permissionsService } from "@/services/permissions.service";

export default function PermissionsPage() {
  const permissionsQuery = useQuery({
    queryFn: permissionsService.list,
    queryKey: ["permissions", "catalog"]
  });

  return (
    <AppLayout>
      <PageHeader
        description="El backend no expone GET /permissions; esta pantalla muestra el catalogo sembrado por prisma/seed.js."
        title="Permisos"
      />

      {permissionsQuery.isLoading ? <LoadingState /> : null}
      {permissionsQuery.data ? (
        <DataTable
          columns={[
            { cell: (row) => row.key, header: "Key" },
            { cell: (row) => row.name, header: "Nombre" },
            { cell: (row) => row.description, header: "Descripcion" }
          ]}
          data={permissionsQuery.data}
          emptyTitle="No hay permisos"
          getRowId={(row) => row.key}
        />
      ) : null}
    </AppLayout>
  );
}
