"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";
import { GlobalSearch } from "./global-search";

interface HeaderSiteProps {
  user?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export function HeaderSite({ user }: HeaderSiteProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isPostReadingPage = Boolean(pathname && pathname.includes("/post/"));

  const [isScrolled, setIsScrolled] = useState(() =>
    typeof window !== "undefined" ? window.scrollY > 120 : false
  );
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Monitora o scroll na página de leitura do post (mobile)
  useEffect(() => {
    if (!isPostReadingPage) {
      return;
    }

    const handleScroll = () => {
      const scrolled = window.scrollY > 120;
      setIsScrolled(scrolled);
      if (!scrolled) {
        setIsSearchExpanded(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isPostReadingPage]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
    } catch (e) {
      console.error("Erro ao sair:", e);
    }
  };

  return (
    <>
      <header className="py-3 sm:py-3.5 border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4">
          {/* Esquerda: Logo oficial + Nome DevBook */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
              title="Ir para o início"
            >
              <Image
                src="/devbook-logo.svg"
                alt="DevBook Logo"
                width={32}
                height={32}
                priority
                className="h-8 w-8 rounded-lg object-contain shadow-sm"
              />
              <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-mono">
                DevBook
              </span>
            </Link>
          </div>

          {/* Direita: Campo de Pesquisa, ThemeToggle e Menu de Usuário */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Campo de Pesquisa Global (Desktop posicionado à direita) */}
            <div className="hidden md:block w-48 sm:w-60 lg:w-72">
              <GlobalSearch variant="header" />
            </div>

            <ThemeToggle />

            {/* Menu de Usuário ou Botão Entrar */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 px-2 sm:px-2.5 rounded-full border-border/70 bg-card hover:bg-muted text-xs cursor-pointer"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-500 font-semibold text-[11px] uppercase">
                      {user.name ? user.name.charAt(0) : "U"}
                    </div>
                    <span className="hidden sm:inline text-xs font-medium max-w-[90px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                    <i className="bx bx-chevron-down text-xs text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 shadow-lg">
                  <div className="px-3 py-2 border-b border-border/50">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>

                  {(user.role === "ADMIN" || user.role === "EDITOR") && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer gap-2 py-2">
                        <i className="bx bx-slider-alt text-base text-blue-400" />
                        <span>Painel Administrativo</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive gap-2 py-2"
                  >
                    <i className="bx bx-log-out text-base" />
                    <span>Sair da conta</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 px-3 text-xs sm:text-sm font-medium hover:bg-muted"
              >
                <Link href="/login">
                  <i className="bx bx-log-in text-base text-muted-foreground" />
                  <span className="hidden sm:inline">Entrar</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Barra de Pesquisa / Ações Flutuantes no Canto Inferior (Mobile) */}
      <div className="md:hidden fixed bottom-4 inset-x-0 z-40 px-3 sm:px-4 flex justify-center pointer-events-none max-w-full">
        {!isPostReadingPage ? (
          /* Comportamento padrão em outras páginas: barra de busca completa */
          <div className="pointer-events-auto w-full max-w-sm sm:max-w-md">
            <GlobalSearch variant="bottom-bar" />
          </div>
        ) : (
          /* Na página do post: animação suave e elegante morphing */
          <div
            className={cn(
              "w-full max-w-sm sm:max-w-md flex items-center justify-between pointer-events-none relative transition-all duration-300",
              isScrolled ? "gap-2" : "gap-0"
            )}
          >
            {/* GlobalSearch com animação de largura contínua */}
            <div
              className={cn(
                "pointer-events-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] min-w-0",
                isScrolled && !isSearchExpanded ? "w-12 shrink-0" : "flex-1"
              )}
            >
              <GlobalSearch
                variant="bottom-bar"
                collapsed={isScrolled && !isSearchExpanded}
                autoFocus={isSearchExpanded}
                onExpand={() => setIsSearchExpanded(true)}
                onClose={() => setIsSearchExpanded(false)}
              />
            </div>

            {/* Botão de Fechar Busca (surge quando a busca foi expandida a partir do scroll) */}
            {isScrolled && isSearchExpanded && (
              <button
                type="button"
                onClick={() => setIsSearchExpanded(false)}
                className="pointer-events-auto h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-full bg-card/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-border/80 text-foreground flex items-center justify-center hover:bg-muted active:scale-95 transition-all duration-200 animate-in fade-in zoom-in-75 shadow-xl"
                aria-label="Fechar pesquisa"
                title="Fechar pesquisa"
              >
                <i className="bx bx-x text-2xl" />
              </button>
            )}

            {/* Botão Flutuante Voltar ao Topo */}
            <button
              type="button"
              onClick={scrollToTop}
              className={cn(
                "h-12 w-12 shrink-0 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/30 flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                isScrolled && !isSearchExpanded
                  ? "pointer-events-auto opacity-100 scale-100 translate-y-0"
                  : "pointer-events-none opacity-0 scale-50 translate-y-4 w-0 h-0 p-0 m-0 overflow-hidden border-0"
              )}
              aria-label="Voltar ao início da página"
              title="Voltar ao início da página"
            >
              <i className="bx bx-chevron-up text-2xl" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
