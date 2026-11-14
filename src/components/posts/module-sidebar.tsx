"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ModuleSidebarPost {
  id: number;
  title: string;
  slug: string;
}

interface ModuleSidebarProps {
  technologySlug: string;
  technologyName: string;
  moduleSlug: string;
  moduleTitle: string;
  posts: ModuleSidebarPost[];
  currentPostSlug: string;
  onPostClick?: () => void;
  className?: string;
}

export function ModuleSidebar({
  technologySlug,
  technologyName,
  moduleSlug,
  moduleTitle,
  posts,
  currentPostSlug,
  onPostClick,
  className,
}: ModuleSidebarProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Cabeçalho do Módulo */}
      <div className="space-y-2 pb-3 border-b border-border/60">
        <Link
          href={`/tecnologias/${technologySlug}/modulos`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
        >
          <i className="bx bx-arrow-back text-sm transition-transform group-hover:-translate-x-0.5" />
          <span>Voltar para {technologyName}</span>
        </Link>

        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Módulo
          </span>
          <h2 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
            {moduleTitle}
          </h2>
        </div>

        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <i className="bx bx-book-open text-xs" />
          <span>
            {posts.length} {posts.length === 1 ? "aula" : "aulas"} disponíveis
          </span>
        </div>
      </div>

      {/* Lista de Aulas / Posts */}
      <nav className="space-y-1">
        {posts.map((post, idx) => {
          const isActive = post.slug === currentPostSlug;
          return (
            <Link
              key={post.id}
              href={`/tecnologias/${technologySlug}/modulos/${moduleSlug}/post/${post.slug}`}
              onClick={onPostClick}
              className={cn(
                "group flex items-start gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150 leading-relaxed",
                isActive
                  ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary rounded-l-none"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-mono mt-0.5",
                  isActive
                    ? "bg-primary text-primary-foreground font-bold"
                    : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20"
                )}
              >
                {idx + 1}
              </span>
              <span className="flex-1 break-words">{post.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
