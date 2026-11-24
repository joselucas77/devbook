"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { GlobalSearch } from "./global-search";
import {
  syncSavedPostsForUser,
  useReadingProgress,
} from "@/hooks/use-reading-progress";

interface HeaderSiteProps {
  user?: {
    id?: string;
    name: string;
    email: string;
    role: string;
    image?: string | null;
  } | null;
}

export function HeaderSite({ user }: HeaderSiteProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isPostReadingPage = Boolean(pathname && pathname.includes("/post/"));
  const { favorites } = useReadingProgress();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isScrolled, setIsScrolled] = useState(() =>
    typeof window !== "undefined" ? window.scrollY > 120 : false
  );
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Sincroniza os posts salvos com a conta autenticada (ou modo visitante)
  useEffect(() => {
    syncSavedPostsForUser(user?.id ?? null);
  }, [user?.id]);

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
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      await syncSavedPostsForUser(null);
      setSidebarOpen(false);
      router.refresh();
    } catch (e) {
      console.error("Erro ao sair:", e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isTechActive = pathname?.startsWith("/tecnologias");
  const isSavedActive = pathname?.startsWith("/salvos");

  return (
    <>
      <header className="py-3 sm:py-3.5 border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4">
          {/* Esquerda: Botão Hambúrguer (Sidebar) + Logo oficial + Nome DevBook */}
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
                    Navegação principal e dados da conta
                  </SheetDescription>
                </SheetHeader>

                {/* Opções principais da Sidebar */}
                <nav
                  aria-label="Menu principal"
                  className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5"
                >
                  <Link
                    href="/tecnologias"
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                      isTechActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <i className="bx bx-code-alt text-lg shrink-0" />
                    <span className="flex-1 truncate">Tecnologias</span>
                  </Link>

                  <Link
                    href="/salvos"
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                      isSavedActive
                        ? "bg-amber-500/15 text-amber-500 font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <i
                      className={cn(
                        "bx text-lg shrink-0",
                        isSavedActive ? "bxs-bookmark" : "bx-bookmark"
                      )}
                    />
                    <span className="flex-1 truncate">Posts Salvos</span>
                    {favorites.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="h-5 min-w-5 px-1.5 text-[11px] font-mono justify-center"
                      >
                        {favorites.length}
                      </Badge>
                    )}
                  </Link>

                  {user &&
                    (user.role === "ADMIN" || user.role === "EDITOR") && (
                      <Link
                        href="/admin"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      >
                        <i className="bx bx-slider-alt text-lg text-blue-500 shrink-0" />
                        <span className="flex-1 truncate">
                          Painel Administrativo
                        </span>
                      </Link>
                    )}
                </nav>

                {/* Rodapé da Sidebar: Perfil do Usuário + Sair da conta */}
                <div className="mt-auto p-4 border-t border-border/60 bg-muted/20 shrink-0">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
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
                            {user.name ? user.name.charAt(0) : "U"}
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

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full justify-start gap-2.5 h-10 px-3 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 cursor-pointer"
                      >
                        <i className="bx bx-log-out text-base shrink-0" />
                        <span>
                          {isLoggingOut ? "Saindo..." : "Sair da conta"}
                        </span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Entre na sua conta para sincronizar seus posts salvos em
                        qualquer dispositivo.
                      </p>
                      <Button
                        asChild
                        className="w-full h-10 gap-2 text-xs font-semibold"
                      >
                        <Link
                          href="/login"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <i className="bx bx-log-in text-base" />
                          <span>Entrar na conta</span>
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-2.5 hover:opacity-90 transition-opacity min-w-0"
              title="Ir para o início"
            >
              <Image
                src="/devbook-logo.svg"
                alt="DevBook Logo"
                width={32}
                height={32}
                priority
                className="h-8 w-8 rounded-lg object-contain shadow-sm shrink-0"
              />
              <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-mono truncate">
                DevBook
              </span>
            </Link>
          </div>

          {/* Direita: Campo de Pesquisa (Desktop) e Switch de Tema */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:block w-48 sm:w-60 lg:w-72">
              <GlobalSearch variant="header" />
            </div>

            <ThemeToggle />
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
