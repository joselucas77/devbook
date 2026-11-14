"use client";

import { useState } from "react";
import { HeadingItem } from "@/lib/toc";
import { ModuleSidebar, ModuleSidebarPost } from "./module-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MobilePostNavProps {
  technologySlug: string;
  technologyName: string;
  moduleSlug: string;
  moduleTitle: string;
  posts: ModuleSidebarPost[];
  currentPostSlug: string;
  headings: HeadingItem[];
}

export function MobilePostNav({
  technologySlug,
  technologyName,
  moduleSlug,
  moduleTitle,
  posts,
  currentPostSlug,
  headings,
}: MobilePostNavProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);

  const currentPostIndex = posts.findIndex((p) => p.slug === currentPostSlug);
  const currentPostNumber =
    currentPostIndex >= 0 ? currentPostIndex + 1 : undefined;

  const handleScrollTo = (id: string) => {
    setTocOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <div className="lg:hidden mb-6 space-y-3">
      {/* Barra de Navegação do Módulo no Mobile */}
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border/70 bg-card/60 backdrop-blur-xs">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 text-xs font-medium cursor-pointer"
            >
              <i className="bx bx-menu-alt-left text-base text-primary" />
              <span>Aulas do Módulo</span>
              {currentPostNumber && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {currentPostNumber}/{posts.length}
                </span>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-[300px] sm:w-[360px] p-5 overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-sm font-semibold">
                Navegação do Módulo
              </SheetTitle>
            </SheetHeader>

            <ModuleSidebar
              technologySlug={technologySlug}
              technologyName={technologyName}
              moduleSlug={moduleSlug}
              moduleTitle={moduleTitle}
              posts={posts}
              currentPostSlug={currentPostSlug}
              onPostClick={() => setSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {headings.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTocOpen((prev) => !prev)}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <i className="bx bx-list-ul text-base text-primary" />
            <span>Nesta página ({headings.length})</span>
            <i
              className={`bx bx-chevron-down text-sm transition-transform duration-200 ${
                tocOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
        )}
      </div>

      {/* Sumário Colapsável no Mobile */}
      {headings.length > 1 && (
        <Collapsible open={tocOpen} onOpenChange={setTocOpen}>
          <CollapsibleContent className="p-3 rounded-lg border border-border/70 bg-card/80 space-y-2 animate-in fade-in-0 duration-200">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tópicos do Artigo
            </p>
            <nav className="space-y-1 pl-1 border-l border-border/60">
              {headings.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleScrollTo(item.id)}
                  className={`block w-full text-left text-xs py-1 transition-colors text-muted-foreground hover:text-primary ${
                    item.level === 3 ? "pl-3 text-[11px]" : "pl-1"
                  }`}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
