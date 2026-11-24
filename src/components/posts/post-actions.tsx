"use client";

import { useReadingProgress } from "@/hooks/use-reading-progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  post: {
    postId?: number;
    slug: string;
    title: string;
    technologySlug: string;
    technologyName: string;
    moduleSlug: string;
    moduleTitle: string;
  };
  className?: string;
}

export function BookmarkButton({ post, className }: BookmarkButtonProps) {
  const { isFavorite, toggleFavorite } = useReadingProgress();
  const favorited = isFavorite(
    post.slug,
    post.moduleSlug,
    post.technologySlug
  );

  const handleClick = () => {
    const isNowFavorite = toggleFavorite(post);
    if (isNowFavorite) {
      toast.success("Artigo salvo nos favoritos!", {
        description: "Você pode acessá-lo facilmente quando quiser.",
      });
    } else {
      toast.info("Artigo removido dos favoritos.");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      aria-label={favorited ? "Remover dos favoritos" : "Salvar nos favoritos"}
      className={cn(
        "h-8 gap-1.5 px-2.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border-border/70",
        favorited
          ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
          : "hover:bg-muted text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <i
        className={cn(
          "text-base",
          favorited ? "bxs-bookmark bx text-amber-500" : "bx-bookmark bx"
        )}
      />
      <span className="hidden sm:inline">
        {favorited ? "Salvo" : "Salvar"}
      </span>
    </Button>
  );
}

interface MarkAsReadCardProps {
  postSlug: string;
  className?: string;
}

export function MarkAsReadCard({ postSlug, className }: MarkAsReadCardProps) {
  const { isPostRead, togglePostRead } = useReadingProgress();
  const read = isPostRead(postSlug);

  const handleToggle = () => {
    const isNowRead = togglePostRead(postSlug);
    if (isNowRead) {
      toast.success("Artigo marcado como concluído!", {
        description: "Seu progresso neste módulo foi atualizado.",
      });
    } else {
      toast.info("Artigo desmarcado.");
    }
  };

  return (
    <div
      className={cn(
        "my-8 p-4 sm:p-5 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
        read
          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
          : "bg-card border-border/70 text-foreground",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-xl transition-colors",
            read
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-muted text-muted-foreground"
          )}
        >
          <i className={cn("bx", read ? "bx-check-double" : "bx-check")} />
        </div>
        <div>
          <h4 className="text-sm font-semibold">
            {read ? "Leitura concluída!" : "Terminou este artigo?"}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {read
              ? "Artigo contabilizado no seu progresso de aprendizado."
              : "Marque como lido para acompanhar seu avanço no módulo."}
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant={read ? "outline" : "default"}
        size="sm"
        onClick={handleToggle}
        className={cn(
          "h-9 px-4 text-xs font-semibold gap-1.5 cursor-pointer shrink-0 transition-colors",
          read
            ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        <i className={cn("bx text-base", read ? "bx-check-circle" : "bx-check")} />
        <span>{read ? "Concluído ✓" : "Marcar como lido"}</span>
      </Button>
    </div>
  );
}

export { calculateReadingTime } from "@/lib/reading-time";
