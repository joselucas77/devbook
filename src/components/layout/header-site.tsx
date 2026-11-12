"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

const Links = [
  { href: "/", label: "Principal" },
  { href: "/tecnologias", label: "Tecnologias" },
];

export function HeaderSite() {
  const currentPath = usePathname();
  const router = useRouter();

  const isHomeOrCatalog = Links.some((link) => link.href === currentPath);

  return (
    <header className="py-4 border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter flex items-center gap-1.5">
          Dev<span className="text-blue-500">Book</span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {isHomeOrCatalog ? (
            <div className="flex items-center space-x-3">
              <Button
                className="bg-blue-600 text-white hover:bg-blue-600/90 transition-colors"
                asChild
              >
                <Link href="/login">Entrar</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-muted-foreground hover:text-foreground"
              >
                <i className="bx bx-arrow-back text-lg mr-1.5" />
                Voltar
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
