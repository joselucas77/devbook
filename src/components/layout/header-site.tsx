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

        {/* Centro: Campo de Pesquisa Global */}
        <div className="flex-1 flex justify-center max-w-xs sm:max-w-sm md:max-w-md">
          <GlobalSearch />
        </div>

        {/* Direita: Acesso ao Painel (apenas Admin/Editor) e ThemeToggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isAdminOrEditor && (
            <Button
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-600/90 h-9 px-3 text-xs sm:text-sm font-medium transition-colors"
              asChild
            >
              <Link href="/admin">
                <i className="bx bx-cog mr-1 sm:mr-1.5 text-base" />
                <span className="hidden sm:inline">Painel Admin</span>
                <span className="sm:hidden">Admin</span>
              </Link>
            </Button>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
