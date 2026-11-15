"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { GlobalSearch } from "./global-search";

export function HeaderSite() {
  const pathname = usePathname();
  const isPostReadingPage = Boolean(pathname && pathname.includes("/post/"));

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isScreenIdle, setIsScreenIdle] = useState(false);

  // Monitora scroll e inatividade da tela para esmaecer botões flutuantes (mobile)
  useEffect(() => {
    let idleTimer: NodeJS.Timeout | null = null;

    const resetIdleTimer = () => {
      setIsScreenIdle(false);
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      idleTimer = setTimeout(() => {
        setIsScreenIdle(true);
      }, 1500);
    };

    // Inicia o timer ao carregar a página (apaga após 1.5s com a tela parada)
    resetIdleTimer();

    const handleScroll = () => {
      if (isPostReadingPage) {
        const scrolled = window.scrollY > 120;
        setIsScrolled(scrolled);
        if (!scrolled) {
          setIsSearchExpanded(false);
        }
      }
      resetIdleTimer();
    };

    const handleInteraction = () => {
      resetIdleTimer();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchstart", handleInteraction, { passive: true });
    window.addEventListener("touchmove", handleInteraction, { passive: true });
    window.addEventListener("touchend", handleInteraction, { passive: true });
    window.addEventListener("wheel", handleInteraction, { passive: true });

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("touchmove", handleInteraction);
      window.removeEventListener("touchend", handleInteraction);
      window.removeEventListener("wheel", handleInteraction);
    };
  }, [isPostReadingPage, pathname]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const shouldDim = isScreenIdle && !isSearchExpanded;

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

          {/* Direita: Campo de Pesquisa (Desktop) e ThemeToggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Campo de Pesquisa Global (Desktop posicionado à direita) */}
            <div className="hidden md:block w-48 sm:w-60 lg:w-72">
              <GlobalSearch variant="header" />
            </div>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Barra de Pesquisa / Ações Flutuantes no Canto Inferior (Mobile) */}
      <div
        className={cn(
          "md:hidden fixed bottom-4 inset-x-0 z-40 px-3 sm:px-4 flex justify-center pointer-events-none max-w-full transition-opacity duration-500 ease-in-out",
          shouldDim
            ? "opacity-30 hover:opacity-100 focus-within:opacity-100 active:opacity-100"
            : "opacity-100"
        )}
      >
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
