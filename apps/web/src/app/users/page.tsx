"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Edit, MapPin, Plus, Power } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { getErrorMessage, optionalString } from "@/lib/errors";
import { statusTone } from "@/lib/utils";
import { branchesService } from "@/services/branches.service";
import { usersService } from "@/services/users.service";
import type { User } from "@/types/user";

const createSchema = z.object({
  branchId: z.string().optional(),
  email: z.string().email("Email invalido"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  password: z.string().min(8, "Minimo 8 caracteres").max(72)
});

const updateSchema = z.object({
  email: z.string().email("Email invalido"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"])
});

const assignBranchSchema = z.object({
  branchId: z.string().min(1, "Selecciona una sucursal")
});

type CreateValues = z.infer<typeof createSchema>;
type UpdateValues = z.infer<typeof updateSchema>;
type AssignBranchValues = z.infer<typeof assignBranchSchema>;

const statusOptions = [
  { label: "Activo", value: "ACTIVE" },
  { label: "Inactivo", value: "INACTIVE" },
  { label: "Bloqueado", value: "BLOCKED" }
];

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const restaurantId = user?.restaurantId ?? "";
  const [mode, setMode] = useState<"create" | "edit" | "branch" | null>(null);
  const [selected, setSelected] = useState<User | null>(null);
  const [confirm, setConfirm] = useState<{ type: "block" | "deactivate"; user: User } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryFn: usersService.list,
    queryKey: ["users"]
  });
  const branchesQuery = useQuery({
    enabled: Boolean(restaurantId),
    queryFn: () => branchesService.list(restaurantId),
    queryKey: ["branches", restaurantId]
  });

  const branchOptions = useMemo(
    () =>
      (branchesQuery.data ?? []).map((branch) => ({
        label: branch.name,
        value: branch.id
      })),
    [branchesQuery.data]
  );

  const createForm = useForm<CreateValues>({
    defaultValues: { branchId: "", email: "", firstName: "", lastName: "", password: "" },
    resolver: zodResolver(createSchema)
  });
  const updateForm = useForm<UpdateValues>({
    defaultValues: { email: "", firstName: "", lastName: "", status: "ACTIVE" },
    resolver: zodResolver(updateSchema)
  });
  const assignForm = useForm<AssignBranchValues>({
    defaultValues: { branchId: "" },
    resolver: zodResolver(assignBranchSchema)
  });

  useEffect(() => {
    if (mode === "create") {
      createForm.reset({ branchId: "", email: "", firstName: "", lastName: "", password: "" });
    }

    if (mode === "edit" && selected) {
      updateForm.reset({
        email: selected.email,
        firstName: selected.firstName ?? "",
        lastName: selected.lastName ?? "",
        status: selected.status
      });
    }

    if (mode === "branch" && selected) {
      assignForm.reset({ branchId: selected.branchId ?? "" });
    }
  }, [assignForm, createForm, mode, selected, updateForm]);

  const createMutation = useMutation({
    mutationFn: (values: CreateValues) =>
      usersService.create({
        branchId: optionalString(values.branchId),
        email: values.email,
        firstName: optionalString(values.firstName),
        lastName: optionalString(values.lastName),
        password: values.password
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setMode(null);
      setFormError(null);
    },
    onError: (error) => setFormError(getErrorMessage(error))
  });

  const updateMutation = useMutation({
    mutationFn: (values: UpdateValues) =>
      usersService.update(selected?.id ?? "", {
        email: values.email,
        firstName: optionalString(values.firstName),
        lastName: optionalString(values.lastName),
        status: values.status
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setMode(null);
      setSelected(null);
      setFormError(null);
    },
    onError: (error) => setFormError(getErrorMessage(error))
  });

  const assignMutation = useMutation({
    mutationFn: (values: AssignBranchValues) =>
      usersService.assignBranch(selected?.id ?? "", values.branchId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setMode(null);
      setSelected(null);
      setFormError(null);
    },
    onError: (error) => setFormError(getErrorMessage(error))
  });

  const actionMutation = useMutation({
    mutationFn: (target: { type: "block" | "deactivate"; userId: string }) =>
      target.type === "block"
        ? usersService.block(target.userId)
        : usersService.deactivate(target.userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setConfirm(null);
    }
  });

  return (
    <AppLayout>
      <PageHeader
        actions={
          <Button onClick={() => setMode("create")} type="button">
            <Plus className="h-4 w-4" />
            Crear usuario
          </Button>
        }
        description="Gestiona usuarios del restaurante actual con endpoints /users."
        title="Usuarios"
      />

      {usersQuery.isLoading ? <LoadingState /> : null}
      {usersQuery.error ? <ErrorState message={getErrorMessage(usersQuery.error)} /> : null}
      {usersQuery.data ? (
        <DataTable
          columns={[
            { cell: (row) => row.email, header: "Email" },
            {
              cell: (row) => [row.firstName, row.lastName].filter(Boolean).join(" ") || "-",
              header: "Nombre"
            },
            { cell: (row) => row.branch?.name ?? "-", header: "Sucursal" },
            {
              cell: (row) => row.roles.map((item) => item.role.name).join(", ") || "-",
              header: "Roles"
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
                      setMode("branch");
                    }}
                    type="button"
                    variant="secondary"
                  >
                    <MapPin className="h-4 w-4" />
                    Sucursal
                  </Button>
                  <Button onClick={() => setConfirm({ type: "block", user: row })} type="button" variant="secondary">
                    <Ban className="h-4 w-4" />
                    Bloquear
                  </Button>
                  <Button onClick={() => setConfirm({ type: "deactivate", user: row })} type="button" variant="danger">
                    <Power className="h-4 w-4" />
                    Desactivar
                  </Button>
                </div>
              ),
              header: "Acciones"
            }
          ]}
          data={usersQuery.data}
          emptyTitle="No hay usuarios"
          getRowId={(row) => row.id}
        />
      ) : null}

      <Modal onClose={() => setMode(null)} open={mode === "create"} title="Crear usuario">
        <form className="grid gap-4" onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))}>
          <FormInput error={createForm.formState.errors.email} label="Email" {...createForm.register("email")} />
          <FormInput
            error={createForm.formState.errors.password}
            label="Contrasena"
            type="password"
            {...createForm.register("password")}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput error={createForm.formState.errors.firstName} label="Nombre" {...createForm.register("firstName")} />
            <FormInput error={createForm.formState.errors.lastName} label="Apellido" {...createForm.register("lastName")} />
          </div>
          <FormSelect
            error={createForm.formState.errors.branchId}
            label="Sucursal"
            options={branchOptions}
            placeholder="Sin sucursal"
            {...createForm.register("branchId")}
          />
          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setMode(null)} type="button" variant="secondary">
              Cancelar
            </Button>
            <Button disabled={createMutation.isPending} type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal onClose={() => setMode(null)} open={mode === "edit"} title="Editar usuario">
        <form className="grid gap-4" onSubmit={updateForm.handleSubmit((values) => updateMutation.mutate(values))}>
          <FormInput error={updateForm.formState.errors.email} label="Email" {...updateForm.register("email")} />
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput error={updateForm.formState.errors.firstName} label="Nombre" {...updateForm.register("firstName")} />
            <FormInput error={updateForm.formState.errors.lastName} label="Apellido" {...updateForm.register("lastName")} />
          </div>
          <FormSelect
            error={updateForm.formState.errors.status}
            label="Estado"
            options={statusOptions}
            {...updateForm.register("status")}
          />
          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setMode(null)} type="button" variant="secondary">
              Cancelar
            </Button>
            <Button disabled={updateMutation.isPending} type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal onClose={() => setMode(null)} open={mode === "branch"} title="Asignar sucursal">
        <form className="grid gap-4" onSubmit={assignForm.handleSubmit((values) => assignMutation.mutate(values))}>
          <FormSelect
            error={assignForm.formState.errors.branchId}
            label="Sucursal"
            options={branchOptions}
            placeholder="Selecciona sucursal"
            {...assignForm.register("branchId")}
          />
          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setMode(null)} type="button" variant="secondary">
              Cancelar
            </Button>
            <Button disabled={assignMutation.isPending} type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        description={
          confirm?.type === "block"
            ? "El usuario quedara bloqueado y no podra iniciar sesion."
            : "El usuario quedara inactivo y oculto de las listas."
        }
        isPending={actionMutation.isPending}
        onCancel={() => setConfirm(null)}
        onConfirm={() =>
          confirm &&
          actionMutation.mutate({
            type: confirm.type,
            userId: confirm.user.id
          })
        }
        open={Boolean(confirm)}
        title={confirm?.type === "block" ? "Bloquear usuario" : "Desactivar usuario"}
      />
    </AppLayout>
  );
}
