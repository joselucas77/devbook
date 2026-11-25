"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";

interface SiteHeaderProps extends React.ComponentProps<"header"> {
  user?: {
    id?: string;
    name: string;
    email: string;
    role?: string;
    image?: string | null;
  } | null;
}

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "bx-bar-chart-square", external: false },
  { label: "Tecnologias", href: "/admin/tecnologias", icon: "bx-code-alt", external: false },
  { label: "Ver Site", href: "/tecnologias", icon: "bx-globe", external: true },
];

export function SiteHeader({
  className,
  user,
  ...props
}: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [failedImageUrl, setFailedImageUrl] = React.useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Falha ao encerrar sessão");

      toast.success("Sessão finalizada com sucesso.");
      setSidebarOpen(false);
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
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <div className="py-3 sm:py-3.5 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4">
        {/* Esquerda: Botão Hambúrguer (Sidebar) + Nome DevBook Admin */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-lg text-foreground hover:bg-muted cursor-pointer"
                aria-label="Abrir menu lateral"
                title="Abrir menu"
              >
                <i className="bx bx-menu text-2xl" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-[85vw] max-w-[360px] p-0 flex flex-col gap-0"
            >
              {/* Topo da Sidebar */}
              <SheetHeader className="px-5 py-4 border-b border-border/60 shrink-0 pr-12">
                <SheetTitle className="flex items-center gap-2.5 text-left">
                  <Image
                    src="/devbook-logo.svg"
                    alt="DevBook Logo"
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-lg object-contain shadow-xs shrink-0"
                  />
                  <span className="text-lg font-bold tracking-tight text-foreground font-mono">
                    DevBook
                  </span>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Navegação administrativa e dados da conta
                </SheetDescription>
              </SheetHeader>

              {/* Navegação principal */}
              <nav
                aria-label="Menu administrativo"
                className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5"
              >
                {navItems.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : item.href === "/admin/tecnologias"
                      ? pathname === "/admin/tecnologias" ||
                        pathname.startsWith("/admin/tecnologias/")
                      : pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      )}
                    >
                      <i className={cn("bx text-lg shrink-0", item.icon)} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.external && (
                        <i className="bx bx-link-external text-xs opacity-60 shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Rodapé da Sidebar: Perfil + Sair */}
              <div className="mt-auto p-4 border-t border-border/60 bg-muted/20 shrink-0">
                {user && (
                  <div className="flex items-center gap-3 mb-3">
                    {user.image && failedImageUrl !== user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name}
                        width={40}
                        height={40}
                        unoptimized
                        referrerPolicy="no-referrer"
                        onError={() => setFailedImageUrl(user.image ?? null)}
                        className="h-10 w-10 rounded-full object-cover border border-border/80 shrink-0 bg-muted"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/20 font-bold text-sm uppercase">
                        {user.name ? user.name.charAt(0) : "A"}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full justify-start gap-2.5 h-10 px-3 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 cursor-pointer"
                >
                  <i className="bx bx-log-out text-base shrink-0" />
                  <span>{isLoggingOut ? "Saindo..." : "Sair do Painel"}</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Link
            href="/admin"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity min-w-0"
            title="Painel Administrativo"
          >
            <span className="text-lg sm:text-xl font-bold tracking-tight font-mono truncate">
              <span className="text-blue-500">Dev</span>
              <span className="text-foreground">Book</span>
            </span>
          </Link>
        </div>

        {/* Direita: ThemeToggle */}
        <div className="flex items-center shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
