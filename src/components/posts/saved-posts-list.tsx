"use client";

import Link from "next/link";
import { useReadingProgress, type FavoritePost } from "@/hooks/use-reading-progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDatePtBR } from "@/lib/format-date";
import { toast } from "sonner";

interface SavedPostsListProps {
  isAuthenticated: boolean;
  initialItems?: FavoritePost[];
}

export function SavedPostsList({
  isAuthenticated,
  initialItems = [],
}: SavedPostsListProps) {
  const { favorites, toggleFavorite, isPostRead } = useReadingProgress();

  const items = favorites.length > 0 ? favorites : initialItems;

  const handleRemove = (item: FavoritePost) => {
    toggleFavorite(item);
    toast.info("Artigo removido dos salvos.");
  };

  return (
    <section className="max-w-4xl mx-auto mb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Posts Salvos
            </h1>
            {items.length > 0 && (
              <Badge
                variant="secondary"
                className="text-xs font-mono px-2 py-0.5"
              >
                {items.length}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            {isAuthenticated
              ? "Seus artigos favoritos ficam salvos na sua conta para ler quando quiser."
              : "Artigos salvos neste dispositivo. Entre na sua conta para sincronizar em qualquer lugar."}
          </p>
        </div>

        {!isAuthenticated && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="self-start sm:self-auto h-9 gap-1.5 text-xs"
          >
            <Link href="/login">
              <i className="bx bx-log-in text-base" />
              <span>Entrar para sincronizar</span>
            </Link>
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-14 px-4 border border-dashed rounded-xl border-border bg-card/40">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
            <i className="bx bx-bookmark text-2xl" />
          </div>
          <h2 className="font-semibold text-base sm:text-lg text-foreground">
            Nenhum post salvo ainda
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Ao ler qualquer artigo, toque no botão{" "}
            <span className="font-semibold text-foreground">Salvar</span> ao lado
            do título para guardá-lo aqui.
          </p>
          <Button asChild className="mt-5 h-9 text-xs sm:text-sm gap-1.5">
            <Link href="/tecnologias">
              <i className="bx bx-code-alt text-base" />
              <span>Explorar tecnologias</span>
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {items.map((item) => {
            const href = `/tecnologias/${item.technologySlug}/modulos/${item.moduleSlug}/post/${item.slug}`;
            const completed = isPostRead(item.slug);

            return (
              <Card
                key={`${item.technologySlug}-${item.moduleSlug}-${item.slug}`}
                className="p-4 border border-border/70 bg-card hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link href={href} className="min-w-0 flex-1 group">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground mb-1.5">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-blue-500/30 text-blue-500 dark:text-blue-400"
                      >
                        {item.technologyName}
                      </Badge>
                      <span>•</span>
                      <span className="truncate max-w-[200px] sm:max-w-xs">
                        {item.moduleTitle}
                      </span>
                      {completed && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-0.5 text-emerald-500 font-medium">
                            <i className="bx bx-check-double text-sm" />
                            Concluído
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors break-words">
                      {item.title}
                    </h3>

                    {item.addedAt && (
                      <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                        <i className="bx bx-time-five text-xs" />
                        <span>Salvo em {formatDatePtBR(item.addedAt)}</span>
                      </p>
                    )}
                  </Link>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(item)}
                    className="h-8 w-8 shrink-0 text-amber-500 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    aria-label={`Remover ${item.title} dos salvos`}
                    title="Remover dos salvos"
                  >
                    <i className="bx bxs-bookmark text-lg" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
