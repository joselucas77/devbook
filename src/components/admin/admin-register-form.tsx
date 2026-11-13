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
import { useTransition } from "react";
import {
  AdminRegisterSchema,
  type AdminRegisterValues,
} from "@/lib/validations/auth";

export function AdminRegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<AdminRegisterValues>({
    resolver: zodResolver(AdminRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      secretKey: "devbook-admin-master-2026",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  async function onSubmit(values: AdminRegisterValues) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
        role: "ADMIN",
        secretKey: values.secretKey,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      toast.error(err?.message ?? "Falha ao cadastrar administrador", {
        description: "Verifique a chave secreta e os dados informados.",
      });
      return;
    }

    toast.success("Administrador cadastrado com sucesso!", {
      description: "Acessando o painel de controle...",
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
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500" />

        <CardHeader className="text-center pb-5 pt-2">
          <div className="flex justify-center mb-2">
            <Badge
              variant="outline"
              className="border-amber-500/30 text-amber-400 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider"
            >
              <i className="bx bx-key text-sm mr-1" />
              Cadastro Secreto de Admin
            </Badge>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
            DevBook Master
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Crie sua credencial de administrador com acesso total
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="admin-name">Nome do Administrador</Label>
              <Input
                id="admin-name"
                type="text"
                placeholder="Seu nome ou apelido"
                autoComplete="name"
                disabled={isPending}
                className="h-10"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-reg-email">E-mail</Label>
              <Input
                id="admin-reg-email"
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
              <Label htmlFor="admin-reg-password">Senha</Label>
              <Input
                id="admin-reg-password"
                type="password"
                placeholder="Mínimo de 6 caracteres"
                autoComplete="new-password"
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

            <div className="space-y-1.5">
              <Label htmlFor="admin-reg-confirmPassword">Confirmar Senha</Label>
              <Input
                id="admin-reg-confirmPassword"
                type="password"
                placeholder="Repita a senha"
                autoComplete="new-password"
                disabled={isPending}
                className="h-10"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-secret-key">Chave de Autorização</Label>
                <span className="text-[10px] text-muted-foreground">
                  Chave do servidor
                </span>
              </div>
              <Input
                id="admin-secret-key"
                type="password"
                placeholder="Chave secreta"
                disabled={isPending}
                className="h-10 font-mono text-xs"
                {...register("secretKey")}
              />
              {errors.secretKey && (
                <p className="text-xs text-destructive mt-1">
                  {errors.secretKey.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 bg-amber-600 text-white hover:bg-amber-600/90 font-medium transition-colors mt-3 cursor-pointer"
            >
              {isPending ? (
                <>
                  <i className="bx bx-loader-alt animate-spin text-base mr-2" />
                  Criando administrador...
                </>
              ) : (
                <>
                  <i className="bx bx-shield-plus text-base mr-1.5" />
                  Cadastrar Administrador
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
