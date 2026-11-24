"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface FeaturedCardProps {
  title: string;
  image: string;
  category?: string;
  slug: string;
  priority?: boolean;
}

export function FeaturedCard({
  title,
  image,
  category: _category,
  slug,
  priority = false,
}: FeaturedCardProps) {
  void _category;

  return (
    <Link
      href={`/tecnologias/${slug}/modulos`}
      className="group block rounded-xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title={`Acessar tecnologia ${title}`}
    >
      <Card className="gap-0 overflow-hidden transition-all duration-200 border border-border/60 group-hover:border-blue-500/50 group-hover:shadow-lg bg-card">
        {/* Imagem (mesmo tamanho original mantido) */}
        <div className="relative h-44 sm:h-56 w-full p-0 bg-muted/20 overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Título centralizado no final do card com padding compacto */}
        <div className="py-2.5 px-3 flex items-center justify-center text-center">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground group-hover:text-blue-500 transition-colors truncate w-full">
            {title}
          </h3>
        </div>
      </Card>
    </Link>
  );
}
