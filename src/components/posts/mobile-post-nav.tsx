"use client";

import { useState } from "react";
import { HeadingItem } from "@/lib/toc";
import { ModuleSidebar, ModuleSidebarPost } from "./module-sidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

  const currentPostIndex = posts.findIndex((p) => p.slug === currentPostSlug);
  const currentPostNumber =
    currentPostIndex >= 0 ? currentPostIndex + 1 : 1;

  const handleHeadingClick = (id: string) => {
    setSheetOpen(false);
    setTimeout(() => {
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
    }, 250);
  };

  return (
    <div className="lg:hidden mb-5 w-full max-w-full">
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between p-3 rounded-xl border border-border/80 bg-card/80 backdrop-blur-xs text-left shadow-xs transition-colors hover:bg-muted/40 cursor-pointer active:scale-[0.99] min-w-0"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <i className="bx bx-book-open text-lg" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground truncate">
                  Módulo • {moduleTitle}
                </p>
                <p className="text-xs font-bold text-foreground truncate">
                  Post {currentPostNumber} de {posts.length} • Ver tópicos e posts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <i className="bx bx-list-ul text-lg text-muted-foreground" />
            </div>
          </button>
        </SheetTrigger>

        {/* Botão de atalho flutuante na direita para abrir a navegação do post a qualquer momento */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label="Abrir navegação do post"
          title="Tópicos e posts do módulo"
          className="lg:hidden fixed bottom-20 right-3 sm:right-4 z-30 h-11 w-11 rounded-full bg-card/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-border/80 text-foreground shadow-xl flex items-center justify-center hover:bg-muted active:scale-95 transition-all cursor-pointer"
        >
          <i className="bx bx-list-ul text-xl text-blue-500" />
        </button>

        <SheetContent
          side="right"
          className="w-[85vw] max-w-[360px] p-5 overflow-y-auto"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-sm font-semibold">
              Navegação do Post
            </SheetTitle>
            <SheetDescription className="sr-only">
              Tópicos do artigo atual e lista de posts do módulo
            </SheetDescription>
          </SheetHeader>

          <ModuleSidebar
            technologySlug={technologySlug}
            technologyName={technologyName}
            moduleSlug={moduleSlug}
            moduleTitle={moduleTitle}
            posts={posts}
            currentPostSlug={currentPostSlug}
            headings={headings}
            onPostClick={() => setSheetOpen(false)}
            onHeadingClick={handleHeadingClick}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
