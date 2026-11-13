"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <Card className="overflow-hidden transition-all border border-border/60 hover:border-blue-500/50 hover:shadow-md bg-card">
      <Link
        href={`/tecnologias/${slug}/modulos`}
        className="relative block h-56 w-full p-0 bg-muted/20 overflow-hidden group"
      >
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <CardContent className="flex items-center justify-between gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3">
        <CardTitle
          className="text-base sm:text-lg font-bold truncate tracking-tight text-foreground min-w-0"
          title={title}
        >
          <Link
            href={`/tecnologias/${slug}/modulos`}
            className="hover:text-blue-500 transition-colors"
          >
            {title}
          </Link>
        </CardTitle>
        <Button
          size="sm"
          className="h-8 px-3 text-xs font-medium shrink-0 bg-blue-600 text-white hover:bg-blue-600/90 transition-colors"
          asChild
        >
          <Link href={`/tecnologias/${slug}/modulos`}>Acessar</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
