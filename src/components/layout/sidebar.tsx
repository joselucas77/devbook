"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AppSidebarProps extends React.ComponentProps<"aside"> {
  variant?: "default" | "inset" | "floating";
}

const navItems = [
  { label: "Tecnologias", href: "/admin", icon: "bx-code-alt", external: false },
  { label: "Ver Site", href: "/tecnologias", icon: "bx-globe", external: true },
];

export function AppSidebar({
  className,
  variant = "inset",
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { open } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Falha ao encerrar sessão");

      toast.success("Sessão finalizada com sucesso.");
      router.push("/admin/login");
      router.refresh();
    } catch (e: unknown) {
      toast.error("Erro ao sair", {
        description: e instanceof Error ? e.message : "Erro desconhecido",
      });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <aside
      data-variant={variant}
      data-state={open ? "expanded" : "collapsed"}
      className={cn(
        "sticky top-0 h-screen h-svh max-h-screen max-h-svh z-30 self-start hidden md:flex md:flex-col border-r border-border bg-card shrink-0 transition-all duration-300 ease-in-out select-none",
        open ? "w-64" : "w-17",
        className,
      )}
      {...props}>
      {/* Topo: Logo oficial + Título DevBook */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-border transition-all duration-300",
          open ? "px-4 justify-start" : "px-0 justify-center",
        )}>
        <Link
          href="/admin"
          className="flex items-center gap-2.5 overflow-hidden"
          title="DevBook">
          <Image
            src="/devbook-logo.svg"
            alt="DevBook Logo"
            width={32}
            height={32}
            priority
            className="h-8 w-8 rounded-lg object-contain shrink-0 shadow-sm"
          />
          {open && (
            <div className="flex items-center gap-1.5 overflow-hidden animate-in fade-in-0 duration-200">
              <span className="font-bold text-base tracking-tight text-foreground font-mono truncate">
                DevBook
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navegação principal */}
      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin" || pathname.startsWith("/admin/")
              : pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              title={!open ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg py-2.5 font-medium text-sm transition-colors",
                open ? "px-3" : "justify-center px-0",
                active
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}>
              <i className={cn("bx text-xl shrink-0", item.icon)} />
              {open && (
                <span className="truncate animate-in fade-in-0 duration-150 flex-1">
                  {item.label}
                </span>
              )}
              {open && item.external && (
                <i className="bx bx-link-external text-xs opacity-60 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé da sidebar: Botão de Sair lá embaixo */}
      <div className="p-3 border-t border-border mt-auto shrink-0">
        {open ? (
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full justify-start gap-2.5 h-10 px-3 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/10 transition-colors">
            <i className="bx bx-log-out text-lg text-destructive shrink-0" />
            <span className="truncate font-medium">
              {isLoggingOut ? "Saindo..." : "Sair do Painel"}
            </span>
          </Button>
        ) : (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="h-10 w-10 text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/10 transition-colors"
              title="Sair do Painel">
              <i className="bx bx-log-out text-lg text-destructive" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
