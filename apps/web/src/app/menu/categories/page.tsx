"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Power } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
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
import { categoriesService } from "@/services/categories.service";
import type { Category } from "@/types/menu";

const schema = z.object({
  description: z.string().max(500).optional(),
  imageUrl: z.string().url("URL invalida").optional().or(z.literal("")),
  name: z.string().min(1, "Nombre requerido").max(120),
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"])
});

type FormValues = z.infer<typeof schema>;

const statusOptions = [
  { label: "Activo", value: "ACTIVE" },
  { label: "Inactivo", value: "INACTIVE" },
  { label: "Bloqueado", value: "BLOCKED" }
];

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Category | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryFn: categoriesService.list,
    queryKey: ["categories"]
  });

  const form = useForm<FormValues>({
    defaultValues: { description: "", imageUrl: "", name: "", status: "ACTIVE" },
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    if (mode === "edit" && selected) {
      form.reset({
        description: selected.description ?? "",
        imageUrl: selected.imageUrl ?? "",
        name: selected.name,
        status: selected.status
      });
    }

    if (mode === "create") {
      form.reset({ description: "", imageUrl: "", name: "", status: "ACTIVE" });
    }
  }, [form, mode, selected]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      selected
        ? categoriesService.update(selected.id, {
            description: optionalString(values.description),
            imageUrl: optionalString(values.imageUrl),
            name: values.name,
            status: values.status
          })
        : categoriesService.create({
            description: optionalString(values.description),
            imageUrl: optionalString(values.imageUrl),
            name: values.name,
            status: values.status
          }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      setMode(null);
      setSelected(null);
      setFormError(null);
    },
    onError: (error) => setFormError(getErrorMessage(error))
  });

  const deactivateMutation = useMutation({
    mutationFn: (categoryId: string) => categoriesService.deactivate(categoryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      setConfirmTarget(null);
    }
  });

  return (
    <AppLayout>
      <PageHeader
        actions={
          <Button onClick={() => setMode("create")} type="button">
            <Plus className="h-4 w-4" />
            Crear categoria
          </Button>
        }
        description="Categorias del restaurante actual desde /menu/categories."
        title="Categorias"
      />

      {categoriesQuery.isLoading ? <LoadingState /> : null}
      {categoriesQuery.error ? <ErrorState message={getErrorMessage(categoriesQuery.error)} /> : null}
      {categoriesQuery.data ? (
        <DataTable
          columns={[
            { cell: (row) => row.name, header: "Nombre" },
            { cell: (row) => row.description ?? "-", header: "Descripcion" },
            {
              cell: (row) => (
                <StatusBadge tone={statusTone(row.status)}>{row.status}</StatusBadge>
              ),
              header: "Estado"
            },
            {
              cell: (row) => (
                <div className="flex gap-2">
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
                  <Button onClick={() => setConfirmTarget(row)} type="button" variant="danger">
                    <Power className="h-4 w-4" />
                    Desactivar
                  </Button>
                </div>
              ),
              header: "Acciones"
            }
          ]}
          data={categoriesQuery.data}
          emptyTitle="No hay categorias"
          getRowId={(row) => row.id}
        />
      ) : null}

      <Modal
        onClose={() => setMode(null)}
        open={mode !== null}
        title={mode === "edit" ? "Editar categoria" : "Crear categoria"}
      >
        <form className="grid gap-4" onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}>
          <FormInput error={form.formState.errors.name} label="Nombre" {...form.register("name")} />
          <FormTextarea
            error={form.formState.errors.description}
            label="Descripcion"
            {...form.register("description")}
          />
          <FormInput error={form.formState.errors.imageUrl} label="Imagen URL" {...form.register("imageUrl")} />
          <FormSelect
            error={form.formState.errors.status}
            label="Estado"
            options={statusOptions}
            {...form.register("status")}
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

      <ConfirmDialog
        description="La categoria quedara inactiva y oculta de las listas."
        isPending={deactivateMutation.isPending}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={() => confirmTarget && deactivateMutation.mutate(confirmTarget.id)}
        open={Boolean(confirmTarget)}
        title="Desactivar categoria"
      />
    </AppLayout>
  );
}
