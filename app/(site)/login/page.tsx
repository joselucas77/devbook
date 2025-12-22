"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginValues = z.infer<typeof LoginSchema>;

export default function Page() {
  const router = useRouter();

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = form;

  async function onSubmit(values: LoginValues) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      toast.error("Falha no login", {
        description: data?.message ?? "Verifique email e senha.",
      });
      return;
    }

    toast.success("Login realizado");
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <section className="max-w-md mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
          Login
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          Acesse o painel para criar e gerenciar posts.
        </p>

        <Card className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                placeholder="seuemail@exemplo.com"
                {...register("email")}
              />
              {errors.email?.message && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password?.message && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full"
            >
              Entrar
            </Button>
          </form>
        </Card>
      </section>
    </main>
  );
}
