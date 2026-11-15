"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { HeadingItem } from "@/lib/toc";

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
  return (
    <div className={cn("space-y-4", className)}>
      {/* Cabeçalho do Módulo */}
      <div className="space-y-2 pb-3 border-b border-border/60">
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
            {posts.length} {posts.length === 1 ? "post" : "posts"} disponíveis
          </span>
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
    </div>
  );
}
