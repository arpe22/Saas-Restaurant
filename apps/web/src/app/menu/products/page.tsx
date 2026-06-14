"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DollarSign, Edit, Plus, Power, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FieldErrors, UseFormRegister, useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { getErrorMessage, optionalString } from "@/lib/errors";
import { statusTone } from "@/lib/utils";
import { categoriesService } from "@/services/categories.service";
import { productsService } from "@/services/products.service";
import type { Product } from "@/types/menu";

const createSchema = z.object({
  categoryId: z.string().optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url("URL invalida").optional().or(z.literal("")),
  isAvailable: z.boolean(),
  name: z.string().min(1, "Nombre requerido").max(160),
  price: z.number().min(0).max(99999999.99),
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"])
});

const updateSchema = createSchema.omit({ price: true });

const priceSchema = z.object({
  price: z.number().min(0).max(99999999.99)
});

type CreateValues = z.infer<typeof createSchema>;
type UpdateValues = z.infer<typeof updateSchema>;
type PriceValues = z.infer<typeof priceSchema>;

const statusOptions = [
  { label: "Activo", value: "ACTIVE" },
  { label: "Inactivo", value: "INACTIVE" },
  { label: "Bloqueado", value: "BLOCKED" }
];

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState("");
  const [mode, setMode] = useState<"create" | "edit" | "price" | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryFn: categoriesService.list,
    queryKey: ["categories"]
  });

  const productsQuery = useQuery({
    queryFn: () =>
      categoryFilter
        ? productsService.listByCategory(categoryFilter)
        : productsService.list(),
    queryKey: ["products", categoryFilter || "all"]
  });

  const categoryOptions = useMemo(
    () =>
      (categoriesQuery.data ?? []).map((category) => ({
        label: category.name,
        value: category.id
      })),
    [categoriesQuery.data]
  );

  const createForm = useForm<CreateValues>({
    defaultValues: {
      categoryId: "",
      description: "",
      imageUrl: "",
      isAvailable: true,
      name: "",
      price: 0,
      status: "ACTIVE"
    },
    resolver: zodResolver(createSchema)
  });
  const updateForm = useForm<UpdateValues>({
    defaultValues: {
      categoryId: "",
      description: "",
      imageUrl: "",
      isAvailable: true,
      name: "",
      status: "ACTIVE"
    },
    resolver: zodResolver(updateSchema)
  });
  const priceForm = useForm<PriceValues>({
    defaultValues: { price: 0 },
    resolver: zodResolver(priceSchema)
  });

  useEffect(() => {
    if (mode === "create") {
      createForm.reset({
        categoryId: "",
        description: "",
        imageUrl: "",
        isAvailable: true,
        name: "",
        price: 0,
        status: "ACTIVE"
      });
    }

    if (mode === "edit" && selected) {
      updateForm.reset({
        categoryId: selected.categoryId ?? "",
        description: selected.description ?? "",
        imageUrl: selected.imageUrl ?? "",
        isAvailable: selected.isAvailable,
        name: selected.name,
        status: selected.status
      });
    }

    if (mode === "price" && selected) {
      priceForm.reset({ price: Number(selected.price) });
    }
  }, [createForm, mode, priceForm, selected, updateForm]);

  const createMutation = useMutation({
    mutationFn: (values: CreateValues) =>
      productsService.create({
        categoryId: optionalString(values.categoryId),
        description: optionalString(values.description),
        imageUrl: optionalString(values.imageUrl),
        isAvailable: values.isAvailable,
        name: values.name,
        price: values.price,
        status: values.status
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      setMode(null);
      setFormError(null);
    },
    onError: (error) => setFormError(getErrorMessage(error))
  });

  const updateMutation = useMutation({
    mutationFn: (values: UpdateValues) =>
      productsService.update(selected?.id ?? "", {
        categoryId: optionalString(values.categoryId),
        description: optionalString(values.description),
        imageUrl: optionalString(values.imageUrl),
        isAvailable: values.isAvailable,
        name: values.name,
        status: values.status
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      setMode(null);
      setSelected(null);
      setFormError(null);
    },
    onError: (error) => setFormError(getErrorMessage(error))
  });

  const priceMutation = useMutation({
    mutationFn: (values: PriceValues) =>
      productsService.changePrice(selected?.id ?? "", values.price),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      setMode(null);
      setSelected(null);
      setFormError(null);
    },
    onError: (error) => setFormError(getErrorMessage(error))
  });

  const statusMutation = useMutation({
    mutationFn: (input: { id: string; status: "ACTIVE" | "INACTIVE" }) =>
      input.status === "ACTIVE"
        ? productsService.activate(input.id)
        : productsService.deactivate(input.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });

  const availabilityMutation = useMutation({
    mutationFn: (input: { id: string; isAvailable: boolean }) =>
      productsService.setAvailability(input.id, input.isAvailable),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });

  return (
    <AppLayout>
      <PageHeader
        actions={
          <Button onClick={() => setMode("create")} type="button">
            <Plus className="h-4 w-4" />
            Crear producto
          </Button>
        }
        description="Productos del restaurante actual desde /menu/products."
        title="Productos"
      />

      <div className="mb-4 max-w-sm">
        <FormSelect
          label="Filtrar por categoria"
          onChange={(event) => setCategoryFilter(event.target.value)}
          options={categoryOptions}
          placeholder="Todas las categorias"
          value={categoryFilter}
        />
      </div>

      {productsQuery.isLoading ? <LoadingState /> : null}
      {productsQuery.error ? <ErrorState message={getErrorMessage(productsQuery.error)} /> : null}
      {productsQuery.data ? (
        <DataTable
          columns={[
            { cell: (row) => row.name, header: "Nombre" },
            { cell: (row) => row.category?.name ?? "-", header: "Categoria" },
            { cell: (row) => `$${Number(row.price).toFixed(2)}`, header: "Precio" },
            {
              cell: (row) => (
                <StatusBadge tone={row.isAvailable ? "good" : "warn"}>
                  {row.isAvailable ? "Disponible" : "No disponible"}
                </StatusBadge>
              ),
              header: "Disponibilidad"
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
                      setMode("price");
                    }}
                    type="button"
                    variant="secondary"
                  >
                    <DollarSign className="h-4 w-4" />
                    Precio
                  </Button>
                  <Button
                    onClick={() =>
                      statusMutation.mutate({
                        id: row.id,
                        status: row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                      })
                    }
                    type="button"
                    variant={row.status === "ACTIVE" ? "danger" : "secondary"}
                  >
                    {row.status === "ACTIVE" ? (
                      <Power className="h-4 w-4" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                    {row.status === "ACTIVE" ? "Desactivar" : "Activar"}
                  </Button>
                  <Button
                    onClick={() =>
                      availabilityMutation.mutate({
                        id: row.id,
                        isAvailable: !row.isAvailable
                      })
                    }
                    type="button"
                    variant="secondary"
                  >
                    {row.isAvailable ? "No disponible" : "Disponible"}
                  </Button>
                </div>
              ),
              header: "Acciones"
            }
          ]}
          data={productsQuery.data}
          emptyTitle="No hay productos"
          getRowId={(row) => row.id}
        />
      ) : null}

      <Modal onClose={() => setMode(null)} open={mode === "create"} title="Crear producto">
        <form className="grid gap-4" onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))}>
          <ProductFields
            categoryOptions={categoryOptions}
            errors={createForm.formState.errors}
            register={
              createForm.register as unknown as UseFormRegister<
                CreateValues | UpdateValues
              >
            }
            includePrice
          />
          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
          <FormActions isPending={createMutation.isPending} onCancel={() => setMode(null)} />
        </form>
      </Modal>

      <Modal onClose={() => setMode(null)} open={mode === "edit"} title="Editar producto">
        <form className="grid gap-4" onSubmit={updateForm.handleSubmit((values) => updateMutation.mutate(values))}>
          <ProductFields
            categoryOptions={categoryOptions}
            errors={updateForm.formState.errors}
            register={
              updateForm.register as unknown as UseFormRegister<
                CreateValues | UpdateValues
              >
            }
          />
          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
          <FormActions isPending={updateMutation.isPending} onCancel={() => setMode(null)} />
        </form>
      </Modal>

      <Modal onClose={() => setMode(null)} open={mode === "price"} title="Cambiar precio">
        <form className="grid gap-4" onSubmit={priceForm.handleSubmit((values) => priceMutation.mutate(values))}>
          <FormInput
            error={priceForm.formState.errors.price}
            label="Precio"
            step="0.01"
            type="number"
            {...priceForm.register("price", { valueAsNumber: true })}
          />
          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
          <FormActions isPending={priceMutation.isPending} onCancel={() => setMode(null)} />
        </form>
      </Modal>
    </AppLayout>
  );
}

function ProductFields({
  categoryOptions,
  errors,
  includePrice = false,
  register
}: {
  categoryOptions: { label: string; value: string }[];
  errors: FieldErrors<CreateValues | UpdateValues>;
  includePrice?: boolean;
  register: UseFormRegister<CreateValues | UpdateValues>;
}) {
  const createErrors = errors as FieldErrors<CreateValues>;

  return (
    <>
      <FormInput error={errors.name} label="Nombre" {...register("name")} />
      <FormSelect
        error={errors.categoryId}
        label="Categoria"
        options={categoryOptions}
        placeholder="Sin categoria"
        {...register("categoryId")}
      />
      <FormTextarea error={errors.description} label="Descripcion" {...register("description")} />
      {includePrice ? (
        <FormInput
          error={createErrors.price}
          label="Precio"
          step="0.01"
          type="number"
          {...register("price", { valueAsNumber: true })}
        />
      ) : null}
      <FormInput error={errors.imageUrl} label="Imagen URL" {...register("imageUrl")} />
      <FormSelect
        error={errors.status}
        label="Estado"
        options={statusOptions}
        {...register("status")}
      />
      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input className="h-4 w-4" type="checkbox" {...register("isAvailable")} />
        Disponible
      </label>
    </>
  );
}

function FormActions({
  isPending,
  onCancel
}: {
  isPending: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button onClick={onCancel} type="button" variant="secondary">
        Cancelar
      </Button>
      <Button disabled={isPending} type="submit">
        Guardar
      </Button>
    </div>
  );
}
