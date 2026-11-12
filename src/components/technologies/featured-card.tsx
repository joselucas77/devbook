"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FeaturedCardProps {
  title: string;
  image: string;
  category: string;
  slug: string;
}

export function FeaturedCard({
  title,
  image,
  category,
  slug,
}: FeaturedCardProps) {
  return (
    <Card className="overflow-hidden transition-all border border-border/60 hover:border-blue-500/50 hover:shadow-md bg-card">
      <CardHeader className="relative h-56 w-full p-0">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </CardHeader>
      <CardContent className="flex items-center justify-between p-5">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <Badge variant="outline" className="gap-1 text-xs">
          <i className="bx bx-tag text-xs text-blue-400" />
          {category}
        </Badge>
      </CardContent>
      <CardFooter className="px-5 pb-5 pt-0">
        <Button
          className="w-full bg-blue-600 text-white hover:bg-blue-600/90 transition-colors"
          asChild
        >
          <Link href={`/tecnologias/${slug}/modulos`}>Acessar módulos</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
