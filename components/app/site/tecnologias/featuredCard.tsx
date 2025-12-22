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

interface FeaturedCardProps {
  title: string;
  description: string;
  image: string;
  date: string;
  category: string;
  icon: React.ReactNode;
  slug: string;
}

export default function FeaturedCard({
  title,
  description,
  image,
  date,
  category,
  icon,
  slug,
}: FeaturedCardProps) {
  return (
    <Card className="transition-colors border border-transparent hover:border-blue-950">
      <div className="relative h-48 w-full">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader className="flex justify-between">
        <CardTitle className="text-xl text-white">{title}</CardTitle>
        <Badge
          variant="secondary"
          className="bg-blue-500 text-white dark:bg-blue-950"
        >
          {icon}
          {category}
        </Badge>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-400">
          {description}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-gray-500 pb-6">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{date}</span>
        </div>
        <Link
          href={`/tecnologias/${slug}/modulos`}
          className="text-blue-500 hover:text-blue-400"
        >
          Acessar Módulos →
        </Link>
      </CardFooter>
    </Card>
  );
}
