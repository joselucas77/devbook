"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import { GlobalSearch } from "./global-search";

export function HeaderSite() {
  const pathname = usePathname();
  const isPostReadingPage = Boolean(pathname && pathname.includes("/post/"));

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Monitora o scroll na página de leitura do post (mobile)
  useEffect(() => {
    if (!isPostReadingPage) {
      setIsScrolled(false);
      setIsSearchExpanded(false);
      return;
    }

    const handleScroll = () => {
      const scrolled = window.scrollY > 120;
      setIsScrolled(scrolled);
      if (!scrolled) {
        setIsSearchExpanded(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isPostReadingPage, pathname]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
      <div className="md:hidden fixed bottom-4 inset-x-0 z-40 px-3 sm:px-4 flex justify-center pointer-events-none max-w-full">
        {!isPostReadingPage ? (
          /* Comportamento padrão em outras páginas: barra de busca completa */
          <div className="pointer-events-auto w-full max-w-sm sm:max-w-md">
            <GlobalSearch variant="bottom-bar" />
          </div>
        ) : !isScrolled ? (
          /* Na página do post, no topo (não rolou ainda): barra completa de busca */
          <div className="pointer-events-auto w-full max-w-sm sm:max-w-md animate-in fade-in duration-200">
            <GlobalSearch variant="bottom-bar" />
          </div>
        ) : isSearchExpanded ? (
          /* Na página do post, rolou para baixo e abriu a busca: expande a barra com foco e botão fechar */
          <div className="pointer-events-auto w-full max-w-sm sm:max-w-md flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex-1 min-w-0">
              <GlobalSearch
                variant="bottom-bar"
                autoFocus
                onClose={() => setIsSearchExpanded(false)}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsSearchExpanded(false)}
              className="h-11 w-11 shrink-0 rounded-full bg-card/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-border/80 text-foreground flex items-center justify-center hover:bg-muted active:scale-95 transition-all shadow-xl"
              aria-label="Fechar pesquisa"
              title="Fechar pesquisa"
            >
              <i className="bx bx-x text-2xl" />
            </button>
          </div>
        ) : (
          /* Na página do post, rolou para baixo (contraído): botão de pesquisa à esquerda e subir ao topo à direita */
          <div className="pointer-events-none w-full max-w-sm sm:max-w-md flex items-center justify-between">
            {/* Botão de Pesquisa Contraído (apenas o ícone) */}
            <button
              type="button"
              onClick={() => setIsSearchExpanded(true)}
              className="pointer-events-auto h-12 w-12 rounded-full bg-card/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-border/80 shadow-2xl shadow-black/40 flex items-center justify-center text-foreground hover:bg-muted/80 active:scale-95 transition-all duration-200 animate-in fade-in zoom-in-90"
              aria-label="Pesquisar"
              title="Pesquisar"
            >
              <i className="bx bx-search text-xl" />
            </button>

            {/* Botão Flutuante Voltar ao Topo */}
            <button
              type="button"
              onClick={scrollToTop}
              className="pointer-events-auto h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/30 flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all duration-200 animate-in fade-in zoom-in-90"
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
