"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Power } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { getErrorMessage } from "@/lib/errors";
import { formatDate, statusTone } from "@/lib/utils";
import { branchesService } from "@/services/branches.service";
import type { Branch } from "@/types/branch";

const schema = z.object({
  name: z.string().min(1, "Nombre requerido").max(120),
  slug: z
    .string()
    .min(1, "Slug requerido")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa formato tipo sucursal-centro"),
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"])
});

type FormValues = z.infer<typeof schema>;

const statusOptions = [
  { label: "Activo", value: "ACTIVE" },
  { label: "Inactivo", value: "INACTIVE" },
  { label: "Bloqueado", value: "BLOCKED" }
];

export default function BranchesPage() {
  const queryClient = useQueryClient();
  const { hasPermission, user } = useAuth();
  const canManage = hasPermission("branches.manage");
  const restaurantId = user?.restaurantId ?? "";
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Branch | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Branch | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const branchesQuery = useQuery({
    enabled: Boolean(restaurantId),
    queryFn: () => branchesService.list(restaurantId),
    queryKey: ["branches", restaurantId]
  });

  const form = useForm<FormValues>({
    defaultValues: { name: "", slug: "", status: "ACTIVE" },
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    if (modalMode === "edit" && selected) {
      form.reset({
        name: selected.name,
        slug: selected.slug,
        status: selected.status
      });
    }

    if (modalMode === "create") {
      form.reset({ name: "", slug: "", status: "ACTIVE" });
    }
  }, [form, modalMode, selected]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      selected
        ? branchesService.update(restaurantId, selected.id, values)
        : branchesService.create(restaurantId, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["branches", restaurantId] });
      setModalMode(null);
      setSelected(null);
      setFormError(null);
    },
    onError: (error) => setFormError(getErrorMessage(error))
  });

  const deactivateMutation = useMutation({
    mutationFn: (branchId: string) => branchesService.deactivate(restaurantId, branchId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["branches", restaurantId] });
      setConfirmTarget(null);
    }
  });

  function openCreate() {
    setSelected(null);
    setFormError(null);
    setModalMode("create");
  }

  function openEdit(branch: Branch) {
    setSelected(branch);
    setFormError(null);
    setModalMode("edit");
  }

  return (
    <AppLayout>
      <PageHeader
        actions={
          canManage ? (
            <Button onClick={openCreate} type="button">
              <Plus className="h-4 w-4" />
              Crear sucursal
            </Button>
          ) : null
        }
        description="Usa GET /restaurants/:restaurantId/branches con el restaurante del token."
        title="Sucursales"
      />

      {branchesQuery.isLoading ? <LoadingState /> : null}
      {branchesQuery.error ? <ErrorState message={getErrorMessage(branchesQuery.error)} /> : null}
      {branchesQuery.data ? (
        <DataTable
          columns={[
            { cell: (row) => row.name, header: "Nombre" },
            { cell: (row) => row.slug, header: "Slug" },
            {
              cell: (row) => (
                <StatusBadge tone={statusTone(row.status)}>{row.status}</StatusBadge>
              ),
              header: "Estado"
            },
            { cell: (row) => formatDate(row.createdAt), header: "Creado" },
            {
              cell: (row) =>
                canManage ? (
                  <div className="flex gap-2">
                    <Button onClick={() => openEdit(row)} type="button" variant="secondary">
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button onClick={() => setConfirmTarget(row)} type="button" variant="danger">
                      <Power className="h-4 w-4" />
                      Desactivar
                    </Button>
                  </div>
                ) : (
                  "-"
                ),
              header: "Acciones"
            }
          ]}
          data={branchesQuery.data}
          emptyTitle="No hay sucursales"
          getRowId={(row) => row.id}
        />
      ) : null}

      <Modal
        onClose={() => setModalMode(null)}
        open={modalMode !== null}
        title={modalMode === "edit" ? "Editar sucursal" : "Crear sucursal"}
      >
        <form className="grid gap-4" onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}>
          <FormInput error={form.formState.errors.name} label="Nombre" {...form.register("name")} />
          <FormInput error={form.formState.errors.slug} label="Slug" {...form.register("slug")} />
          <FormSelect
            error={form.formState.errors.status}
            label="Estado"
            options={statusOptions}
            {...form.register("status")}
          />
          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setModalMode(null)} type="button" variant="secondary">
              Cancelar
            </Button>
            <Button disabled={saveMutation.isPending} type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        description="La sucursal quedara inactiva en el backend."
        isPending={deactivateMutation.isPending}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={() => confirmTarget && deactivateMutation.mutate(confirmTarget.id)}
        open={Boolean(confirmTarget)}
        title="Desactivar sucursal"
      />
    </AppLayout>
  );
}
