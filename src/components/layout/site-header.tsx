"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { toast } from "sonner";

interface SiteHeaderProps extends React.ComponentProps<"header"> {
  user?: {
    name: string;
    email: string;
    role?: string;
  } | null;
}

export function SiteHeader({ className, user, ...props }: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const isRootAdmin = pathname === "/admin";

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Falha ao encerrar sessão");

      toast.success("Sessão finalizada com sucesso.");
      router.push("/login");
      router.refresh();
    } catch (e: any) {
      toast.error("Erro ao sair", { description: e?.message });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-6",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {!isRootAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground gap-1.5"
          >
            <i className="bx bx-arrow-back text-base" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
        )}
        <span className="font-semibold text-sm md:text-base text-foreground">
          Painel de Administração
        </span>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        {user && (
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-medium leading-none">{user.name}</span>
            <span className="text-xs text-muted-foreground mt-0.5 font-mono">
              {user.role}
            </span>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground hover:text-destructive hover:border-destructive/40 gap-1.5"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <i className="bx bx-log-out text-base" />
          <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
        </Button>
      </div>
    </header>
  );
}
