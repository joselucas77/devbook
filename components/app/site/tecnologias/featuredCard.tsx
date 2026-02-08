"use client";

import { Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../../../ui/badge";
import { Button } from "@/components/ui/button";

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
  return (
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
          // className="bg-blue-500 text-white dark:bg-blue-950"
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
          <Link href={`/tecnologias/${slug}/modulos`}>Acessar módulos</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
