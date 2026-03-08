"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../../../ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FeaturedCardProps {
  title: string;
  image: string;
  category: string;
  icon: React.ReactNode;
  slug: string;
}

export default function FeaturedCard({
  title,
  image,
  category,
  icon,
  slug,
}: FeaturedCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
  };

  return (
    <>
      {/* Overlay de loading */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
              <div className="relative rounded-full border border-blue-500/30 bg-gray-900/80 p-5">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-semibold text-white">Carregando</h2>
              <p className="text-sm text-gray-400">Aguarde um momento...</p>
            </div>
          </div>
        </div>
      )}

      <Card className="overflow-hidden transition-colors border border-transparent hover:border-blue-950">
        <CardHeader className="relative h-48 w-full">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover"
          />
        </CardHeader>
        <CardContent className="flex justify-between">
          <CardTitle className="text-xl text-white">{title}</CardTitle>
          <Badge
            variant="default"
          >
            {icon}
            {category}
          </Badge>
        </CardContent>
        <CardFooter className="flex text-sm text-gray-500 pb-6">
          <Button
            className="w-full bg-blue-600 text-white hover:bg-blue-600/90 transition-colors"
            asChild
          >
            <Link href={`/tecnologias/${slug}/modulos`} onClick={handleClick}>
              Acessar módulos
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
