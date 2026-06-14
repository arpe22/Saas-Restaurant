"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChefHat } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/components/forms/form-input";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";

const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(1, "La contrasena es requerida")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const nextPath = useMemo(() => {
    if (typeof window === "undefined") {
      return "/dashboard";
    }

    return new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
  }, []);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: ""
    },
    resolver: zodResolver(loginSchema)
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(nextPath);
    }
  }, [isAuthenticated, nextPath, router]);

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);

    try {
      await login(values);
      router.replace(nextPath);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand text-white">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">Restaurant SaaS</h1>
            <p className="text-sm text-muted">Acceso administrativo</p>
          </div>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            error={errors.email}
            label="Email"
            type="email"
            {...register("email")}
          />
          <FormInput
            error={errors.password}
            label="Contrasena"
            type="password"
            {...register("password")}
          />

          {serverError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </p>
          ) : null}

          <Button disabled={isSubmitting} type="submit">
            Iniciar sesion
          </Button>
        </form>
      </section>
    </main>
  );
}
