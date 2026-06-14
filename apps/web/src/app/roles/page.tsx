"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, KeyRound, Plus, Power } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/components/forms/form-input";
import { FormTextarea } from "@/components/forms/form-textarea";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { getErrorMessage, optionalString } from "@/lib/errors";
import { statusTone } from "@/lib/utils";
import { permissionsService } from "@/services/permissions.service";
import { rolesService } from "@/services/roles.service";
import type { Role } from "@/types/role";

const schema = z.object({
  description: z.string().max(255).optional(),
  name: z.string().min(1, "Nombre requerido").max(80)
});

type FormValues = z.infer<typeof schema>;

export default function RolesPage() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"create" | "edit" | "permissions" | null>(null);
  const [selected, setSelected] = useState<Role | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Role | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const rolesQuery = useQuery({
    queryFn: rolesService.list,
    queryKey: ["roles"]
  });
  const permissionsQuery = useQuery({
    queryFn: permissionsService.list,
    queryKey: ["permissions", "catalog"]
  });

  const form = useForm<FormValues>({
    defaultValues: { description: "", name: "" },
    resolver: zodResolver(schema)
  });

  const currentPermissionKeys = useMemo(
    () =>
      (selected?.permissions ?? []).map((item) => item.permission.key),
    [selected]
  );

  useEffect(() => {
    if (mode === "edit" && selected) {
      form.reset({
        description: selected.description ?? "",
        name: selected.name
      });
    }

    if (mode === "create") {
      form.reset({ description: "", name: "" });
    }

    if (mode === "permissions" && selected) {
      setSelectedPermissions(currentPermissionKeys);
    }
  }, [currentPermissionKeys, form, mode, selected]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      selected
        ? rolesService.update(selected.id, {
            description: optionalString(values.description),
            name: values.name
          })
        : rolesService.create({
            description: optionalString(values.description),
            name: values.name
          }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      setMode(null);
      setSelected(null);
      setFormError(null);
    },
    onError: (error) => setFormError(getErrorMessage(error))
  });

  const permissionsMutation = useMutation({
    mutationFn: async () => {
      if (!selected) {
        return null;
      }

      const toAdd = selectedPermissions.filter(
        (key) => !currentPermissionKeys.includes(key)
      );
      const toRemove = currentPermissionKeys.filter(
        (key) => !selectedPermissions.includes(key)
      );

      if (toAdd.length > 0) {
        await rolesService.assignPermissions(selected.id, toAdd);
      }

      if (toRemove.length > 0) {
        await rolesService.removePermissions(selected.id, toRemove);
      }

      return null;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      setMode(null);
      setSelected(null);
    },
    onError: (error) => setFormError(getErrorMessage(error))
  });

  const deactivateMutation = useMutation({
    mutationFn: (roleId: string) => rolesService.deactivate(roleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      setConfirmTarget(null);
    }
  });

  function togglePermission(permissionKey: string) {
    setSelectedPermissions((current) =>
      current.includes(permissionKey)
        ? current.filter((key) => key !== permissionKey)
        : [...current, permissionKey]
    );
  }

  return (
    <AppLayout>
      <PageHeader
        actions={
          <Button onClick={() => setMode("create")} type="button">
            <Plus className="h-4 w-4" />
            Crear rol
          </Button>
        }
        description="Roles del restaurante actual y permisos asociados."
        title="Roles"
      />

      {rolesQuery.isLoading ? <LoadingState /> : null}
      {rolesQuery.error ? <ErrorState message={getErrorMessage(rolesQuery.error)} /> : null}
      {rolesQuery.data ? (
        <DataTable
          columns={[
            { cell: (row) => row.name, header: "Nombre" },
            { cell: (row) => row.description ?? "-", header: "Descripcion" },
            {
              cell: (row) => row.permissions?.map((item) => item.permission.key).join(", ") || "-",
              header: "Permisos"
            },
            {
              cell: (row) => (
                <StatusBadge tone={statusTone(row.status)}>{row.status}</StatusBadge>
              ),
              header: "Estado"
            },
            {
              cell: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      setSelected(row);
                      setMode("edit");
                    }}
                    type="button"
                    variant="secondary"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => {
                      setSelected(row);
                      setMode("permissions");
                    }}
                    type="button"
                    variant="secondary"
                  >
                    <KeyRound className="h-4 w-4" />
                    Permisos
                  </Button>
                  <Button onClick={() => setConfirmTarget(row)} type="button" variant="danger">
                    <Power className="h-4 w-4" />
                    Desactivar
                  </Button>
                </div>
              ),
              header: "Acciones"
            }
          ]}
          data={rolesQuery.data}
          emptyTitle="No hay roles"
          getRowId={(row) => row.id}
        />
      ) : null}

      <Modal
        onClose={() => setMode(null)}
        open={mode === "create" || mode === "edit"}
        title={mode === "edit" ? "Editar rol" : "Crear rol"}
      >
        <form className="grid gap-4" onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}>
          <FormInput error={form.formState.errors.name} label="Nombre" {...form.register("name")} />
          <FormTextarea
            error={form.formState.errors.description}
            label="Descripcion"
            {...form.register("description")}
          />
          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setMode(null)} type="button" variant="secondary">
              Cancelar
            </Button>
            <Button disabled={saveMutation.isPending} type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal onClose={() => setMode(null)} open={mode === "permissions"} title="Asignar permisos">
        <div className="grid gap-3">
          {permissionsQuery.data?.map((permission) => (
            <label
              className="flex items-start gap-3 rounded-md border border-line p-3"
              key={permission.key}
            >
              <input
                checked={selectedPermissions.includes(permission.key)}
                className="mt-1"
                onChange={() => togglePermission(permission.key)}
                type="checkbox"
              />
              <span>
                <span className="block text-sm font-semibold text-ink">{permission.key}</span>
                <span className="block text-sm text-muted">{permission.description}</span>
              </span>
            </label>
          ))}
          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setMode(null)} type="button" variant="secondary">
              Cancelar
            </Button>
            <Button
              disabled={permissionsMutation.isPending}
              onClick={() => permissionsMutation.mutate()}
              type="button"
            >
              Guardar permisos
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        description="El rol quedara inactivo y no se usara para construir permisos del token."
        isPending={deactivateMutation.isPending}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={() => confirmTarget && deactivateMutation.mutate(confirmTarget.id)}
        open={Boolean(confirmTarget)}
        title="Desactivar rol"
      />
    </AppLayout>
  );
}
