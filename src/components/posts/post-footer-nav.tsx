"use client";

import Link from "next/link";

export interface PostNavItem {
  title: string;
  slug: string;
  moduleSlug: string;
  moduleTitle?: string;
}

interface PostFooterNavProps {
  technologySlug: string;
  prevNav: PostNavItem | null;
  nextNav: PostNavItem | null;
}

export function PostFooterNav({
  technologySlug,
  prevNav,
  nextNav,
}: PostFooterNavProps) {
  if (!prevNav && !nextNav) return null;

  const handleNavClick = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  };

  return (
    <div className="mt-16 pt-8 border-t border-border/60 w-full max-w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevNav ? (
          <Link
            href={`/tecnologias/${technologySlug}/modulos/${prevNav.moduleSlug}/post/${prevNav.slug}`}
            scroll={false}
            onClick={handleNavClick}
            className="group flex flex-col p-4 rounded-xl border border-border/70 bg-card hover:bg-muted/40 hover:border-primary/40 transition-all text-left shadow-xs min-w-0"
          >
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 group-hover:text-primary transition-colors">
              <i className="bx bx-chevron-left text-base shrink-0" />
              {prevNav.moduleTitle
                ? `Módulo anterior: ${prevNav.moduleTitle}`
                : "Post anterior"}
            </span>
            <span className="text-sm font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors break-words">
              {prevNav.title}
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}

        {nextNav && (
          <Link
            href={`/tecnologias/${technologySlug}/modulos/${nextNav.moduleSlug}/post/${nextNav.slug}`}
            scroll={false}
            onClick={handleNavClick}
            className="group flex flex-col p-4 rounded-xl border border-border/70 bg-card hover:bg-muted/40 hover:border-primary/40 transition-all text-right items-end shadow-xs min-w-0"
          >
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 group-hover:text-primary transition-colors">
              {nextNav.moduleTitle
                ? `Próximo módulo: ${nextNav.moduleTitle}`
                : "Próximo post"}
              <i className="bx bx-chevron-right text-base shrink-0" />
            </span>
            <span className="text-sm font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors break-words">
              {nextNav.title}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
