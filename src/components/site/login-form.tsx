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
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useTransition } from "react";
import { LoginSchema, type LoginValues } from "@/lib/validations/auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  async function onSubmit(values: LoginValues) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      toast.error(err?.message ?? "Falha ao entrar", {
        description: "Verifique suas credenciais e tente novamente.",
      });
      return;
    }

    toast.success("Login realizado com sucesso!", {
      description: "Redirecionando para a área administrativa...",
    });

    startTransition(() => {
      router.push("/admin");
      router.refresh();
    });
  }

  function handleGoogleLogin() {
    startGoogleTransition(async () => {
      try {
        await authClient.signIn.social({
          provider: "google",
          callbackURL: "/api/auth/oauth/callback",
        });
      } catch (err: any) {
        toast.error("Erro ao autenticar com Google", {
          description: err?.message,
        });
      }
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border border-border/70 bg-card py-6 sm:py-8 px-2 sm:px-4 shadow-xl rounded-2xl">
        <CardHeader className="text-center pb-5 pt-2">
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
            DevBook
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Acesse o painel com sua conta Google ou e-mail
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Botão Google */}
            <Button
              variant="outline"
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGooglePending || isPending}
              className="w-full h-11 gap-2.5 border-border/80 hover:bg-muted/50 font-medium text-sm transition-colors"
            >
              {isGooglePending ? (
                <i className="bx bx-loader-alt animate-spin text-base" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              <span>Entrar com Google</span>
            </Button>

            {/* Separador sem fundo preto */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-border/80 flex-grow" />
              <span className="text-xs text-muted-foreground px-3 shrink-0">
                ou continue com e-mail
              </span>
              <div className="border-t border-border/80 flex-grow" />
            </div>

            {/* Campos de login */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  disabled={isPending || isGooglePending}
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
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  disabled={isPending || isGooglePending}
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
                disabled={isPending || isGooglePending}
                className="w-full h-11 bg-blue-600 text-white hover:bg-blue-600/90 font-medium transition-colors mt-3"
              >
                {isPending ? (
                  <>
                    <i className="bx bx-loader-alt animate-spin text-base mr-2" />
                    Entrando...
                  </>
                ) : (
                  "Entrar com credenciais"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
