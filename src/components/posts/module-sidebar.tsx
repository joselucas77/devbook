"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { HeadingItem } from "@/lib/toc";
import { useReadingProgress } from "@/hooks/use-reading-progress";

export interface ModuleSidebarPost {
  id: number;
  title: string;
  slug: string;
}

interface ModuleSidebarProps {
  technologySlug: string;
  technologyName?: string;
  moduleSlug: string;
  moduleTitle: string;
  posts: ModuleSidebarPost[];
  currentPostSlug: string;
  headings?: HeadingItem[];
  onPostClick?: () => void;
  onHeadingClick?: (id: string) => void;
  className?: string;
}

export function ModuleSidebar({
  technologySlug,
  technologyName,
  moduleSlug,
  moduleTitle,
  posts,
  currentPostSlug,
  headings = [],
  onPostClick,
  onHeadingClick,
  className,
}: ModuleSidebarProps) {
  const { isPostRead, getModuleProgress } = useReadingProgress();
  const progress = getModuleProgress(posts.map((p) => p.slug));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Cabeçalho do Módulo */}
      <div className="space-y-2 pb-3 border-b border-border/60">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {technologyName ? `${technologyName} • Módulo` : "Módulo"}
          </span>
          <h2 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
            {moduleTitle}
          </h2>
        </div>

        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <i className="bx bx-book-open text-xs" />
          <span>
            {posts.length} {posts.length === 1 ? "post" : "posts"} disponíveis
          </span>
        </div>

        {/* Barra de Progresso do Módulo */}
        <div className="pt-1.5">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-muted-foreground">Concluído</span>
            <span className="font-semibold text-emerald-500 text-xs">
              {progress.completed}/{progress.total} ({progress.percentage}%)
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tópicos do Post Atual (Visível no Sheet mobile quando houver tópicos) */}
      {headings && headings.length > 1 && (
        <div className="space-y-2 pb-3 border-b border-border/60">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <i className="bx bx-list-ul text-xs text-primary" /> Tópicos deste post
          </span>
          <nav className="space-y-1 pl-2 border-l border-border/60">
            {headings.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onHeadingClick?.(item.id)}
                className={cn(
                  "block w-full text-left text-xs py-1 transition-colors text-muted-foreground hover:text-foreground cursor-pointer truncate",
                  item.level === 3 ? "pl-3 text-[11px]" : "pl-1"
                )}
              >
                {item.text}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Lista de Posts */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Posts do Módulo
        </span>
        <nav className="space-y-1">
          {posts.map((post, idx) => {
            const isActive = post.slug === currentPostSlug;
            const isCompleted = isPostRead(post.slug);

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
                    isCompleted
                      ? "bg-emerald-500/20 text-emerald-500 font-bold"
                      : isActive
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20"
                  )}
                >
                  {isCompleted ? (
                    <i className="bx bx-check text-xs font-bold" />
                  ) : (
                    idx + 1
                  )}
                </span>
                <span
                  className={cn(
                    "flex-1 break-words",
                    isCompleted && !isActive && "text-muted-foreground/80 line-through decoration-muted-foreground/40"
                  )}
                >
                  {post.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
