import Link from "next/link";
import { ModuleSidebarPost } from "./module-sidebar";

interface PostFooterNavProps {
  technologySlug: string;
  moduleSlug: string;
  prevPost: ModuleSidebarPost | null;
  nextPost: ModuleSidebarPost | null;
}

export function PostFooterNav({
  technologySlug,
  moduleSlug,
  prevPost,
  nextPost,
}: PostFooterNavProps) {
  if (!prevPost && !nextPost) return null;

  return (
    <div className="mt-16 pt-8 border-t border-border/60">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevPost ? (
          <Link
            href={`/tecnologias/${technologySlug}/modulos/${moduleSlug}/post/${prevPost.slug}`}
            className="group flex flex-col p-4 rounded-xl border border-border/70 bg-card hover:bg-muted/40 hover:border-primary/40 transition-all text-left shadow-xs"
          >
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 group-hover:text-primary transition-colors">
              <i className="bx bx-chevron-left text-base" /> Aula anterior
            </span>
            <span className="text-sm font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors">
              {prevPost.title}
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}

        {nextPost && (
          <Link
            href={`/tecnologias/${technologySlug}/modulos/${moduleSlug}/post/${nextPost.slug}`}
            className="group flex flex-col p-4 rounded-xl border border-border/70 bg-card hover:bg-muted/40 hover:border-primary/40 transition-all text-right items-end shadow-xs"
          >
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 group-hover:text-primary transition-colors">
              Próxima aula <i className="bx bx-chevron-right text-base" />
            </span>
            <span className="text-sm font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors">
              {nextPost.title}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
