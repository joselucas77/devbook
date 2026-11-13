"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { GlobalSearch } from "./global-search";
import { useEffect, useState } from "react";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
}

const HomeOrCatalogPaths = ["/", "/tecnologias"];

export function HeaderSite() {
  const currentPath = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  const isHomeOrCatalog = HomeOrCatalogPaths.includes(currentPath);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.isAuthenticated && data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error("Erro ao validar sessão:", err);
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [currentPath]);

  const isAdminOrEditor = user?.role === "ADMIN" || user?.role === "EDITOR";

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

          {/* Centro: Campo de Pesquisa Global (Desktop) */}
          <div className="hidden md:flex flex-1 justify-center max-w-xs sm:max-w-sm md:max-w-md">
            <GlobalSearch variant="header" />
          </div>

          {/* Direita: Acesso ao Painel (apenas Admin/Editor) e ThemeToggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isAdminOrEditor && (
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground border-border/80"
                asChild
                title="Acessar Painel de Administração"
              >
                <Link href="/admin">
                  <i className="bx bx-cog text-lg" />
                </Link>
              </Button>
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Barra de Pesquisa Flutuante Fixa no Canto Inferior (Mobile) */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 z-40 px-3 sm:px-4 flex justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-sm sm:max-w-md">
          <GlobalSearch variant="bottom-bar" />
        </div>
      </div>
    </>
  );
}
