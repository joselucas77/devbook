"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { LoginSchema, type LoginValues } from "@/lib/validations/auth";

export function AdminLoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(
    null
  );

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "", adminOnly: true },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  async function onSubmit(values: LoginValues) {
    setAccessDeniedMessage(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
        adminOnly: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      if (res.status === 403) {
        setAccessDeniedMessage(
          err?.message ??
            "Acesso restrito. Esta conta não possui privilégios de administrador."
        );
        toast.error("Acesso negado", {
          description:
            "Sua conta é de visualizador e não tem permissão para acessar o painel de controle.",
        });
        return;
      }

      toast.error(err?.message ?? "Falha ao autenticar", {
        description: "Verifique suas credenciais de administrador.",
      });
      return;
    }

    toast.success("Login de administrador realizado com sucesso!", {
      description: "Carregando o painel de controle...",
    });

    startTransition(() => {
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border border-border/80 bg-card py-6 sm:py-8 px-2 sm:px-4 shadow-2xl rounded-2xl relative overflow-hidden">
        {/* Glow de acento admin */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500" />

        <CardHeader className="text-center pb-5 pt-2">
          <div className="flex justify-center mb-2">
            <Badge
              variant="outline"
              className="border-blue-500/30 text-blue-400 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider"
            >
              <i className="bx bx-shield-quarter text-sm mr-1" />
              Painel Administrativo
            </Badge>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
            DevBook Admin
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Autenticação restrita para gerenciamento da documentação
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-2">
          {accessDeniedMessage && (
            <div className="mb-4 p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-xs flex items-start gap-2">
              <i className="bx bx-error-circle text-base shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Acesso Bloqueado</p>
                <p className="text-destructive/90 mt-0.5">
                  {accessDeniedMessage}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-email">E-mail de Administrador</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@devbook.com"
                autoComplete="email"
                disabled={isPending}
                className="h-10"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Senha</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                disabled={isPending}
                className="h-10"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 bg-blue-600 text-white hover:bg-blue-600/90 font-medium transition-colors mt-3 cursor-pointer"
            >
              {isPending ? (
                <>
                  <i className="bx bx-loader-alt animate-spin text-base mr-2" />
                  Autenticando...
                </>
              ) : (
                <>
                  <i className="bx bx-lock-alt text-base mr-1.5" />
                  Entrar no Painel
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
