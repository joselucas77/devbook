"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { GlobalSearch } from "./global-search";

const HomeOrCatalogPaths = ["/", "/tecnologias"];

export function HeaderSite() {
  const currentPath = usePathname();
  const router = useRouter();

  const isHomeOrCatalog = HomeOrCatalogPaths.includes(currentPath);

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

            {!isHomeOrCatalog && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-muted-foreground hover:text-foreground h-8 px-2 text-xs hidden sm:inline-flex items-center gap-1"
              >
                <i className="bx bx-arrow-back text-sm" />
                <span>Voltar</span>
              </Button>
            )}
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

      {/* Barra de Pesquisa Flutuante Fixa no Canto Inferior (Mobile) */}
      <div className="md:hidden fixed bottom-4 inset-x-0 z-40 px-3 sm:px-4 flex justify-center pointer-events-none max-w-full">
        <div className="pointer-events-auto w-full max-w-sm sm:max-w-md">
          <GlobalSearch variant="bottom-bar" />
        </div>
      </div>
    </>
  );
}
