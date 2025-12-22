import ModuleFolder from "@/components/app/site/modulos/moduleFolder";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { BookOpen, Code, Layers } from "lucide-react";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ technologySlug: string }>;
}) {
  const { technologySlug: slug } = await params;

  const technology = await prisma.technology.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      description: true,
      modules: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          posts: {
            where: { isPublic: true, status: "PUBLISHED" },
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!technology) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Tecnologia não encontrada
        </h1>
        <Link href="/" className="link-primary mt-4 inline-block">
          Voltar para o início
        </Link>
      </div>
    );
  }

  const totalTopics = technology.modules.reduce(
    (acc, mod) => acc + mod.posts.length,
    0
  );

  return (
    <section className="max-w-3xl mx-auto mb-20">
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            {technology.name}
          </h1>
        </div>

        <p className="text-muted-foreground max-w-2xl mb-6">
          {technology.description}
        </p>

        <div className="w-full flex items-center justify-between gap-6">
          <div className="flex w-full items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-blue-500">
              <Layers className="h-4 w-4 text-blue-500" />
              <span>{technology.modules.length} módulos</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-500">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span>{totalTopics} tópicos</span>
            </div>
          </div>

          <Badge className="bg-blue-500 text-white dark:bg-blue-950">
            <Code className="h-5 w-5" />
            {technology.category}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1">
        {technology.modules.map((mod) => (
          <ModuleFolder
            key={mod.id}
            technologySlug={technology.slug}
            moduleTitle={mod.title}
            moduleSlug={mod.slug}
            posts={mod.posts}
          />
        ))}
      </div>
    </section>
  );
}
