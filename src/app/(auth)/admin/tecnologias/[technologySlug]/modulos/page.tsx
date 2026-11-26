import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ModulesTable } from "./modules-table";
import { Button } from "@/components/ui/button";

export default async function AdminModulesPage({
  params,
}: {
  params: Promise<{ technologySlug: string }>;
}) {
  const { technologySlug } = await params;

  if (!technologySlug) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Slug de tecnologia inválido.</p>
      </div>
    );
  }

  const technology = await prisma.technology.findUnique({
    where: { slug: technologySlug },
    select: { id: true, name: true, slug: true },
  });

  if (!technology) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-muted-foreground">Tecnologia não encontrada.</p>
        <Button asChild variant="outline">
          <Link href="/admin/tecnologias">Voltar para Tecnologias</Link>
        </Button>
      </div>
    );
  }

  const modules = await prisma.module.findMany({
    where: { technologyId: technology.id },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      order: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { posts: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mb-1">
            <Link href="/admin" className="hover:text-blue-500 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/admin/tecnologias" className="hover:text-blue-500 transition-colors">
              Tecnologias
            </Link>
            <span>/</span>
            <span>{technology.name}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {technology.name}
          </h1>
          <p className="hidden md:block text-sm text-muted-foreground mt-1">
            Gerencie os módulos e os artigos vinculados a esta tecnologia.
          </p>
        </div>
      </div>

      <ModulesTable
        technologyId={technology.id}
        technologyName={technology.name}
        technologySlug={technology.slug}
        data={modules.map((m) => ({
          id: m.id,
          title: m.title,
          slug: m.slug,
          order: m.order,
          technologyId: technology.id,
          postsCount: m._count.posts,
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
