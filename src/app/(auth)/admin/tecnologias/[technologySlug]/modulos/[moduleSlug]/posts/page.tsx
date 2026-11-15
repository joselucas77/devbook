import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostsTable } from "./posts-table";
import { Button } from "@/components/ui/button";

export default async function AdminPostsPage({
  params,
}: {
  params: Promise<{ moduleSlug: string; technologySlug: string }>;
}) {
  const { moduleSlug, technologySlug } = await params;

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
          <Link href="/admin">Voltar para Tecnologias</Link>
        </Button>
      </div>
    );
  }

  if (!moduleSlug) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Slug de módulo inválido.</p>
      </div>
    );
  }

  const module = await prisma.module.findFirst({
    where: {
      slug: moduleSlug,
      technologyId: technology.id,
    },
    include: { technology: true },
  });

  if (!module) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-muted-foreground">Módulo não encontrado.</p>
        <Button asChild variant="outline">
          <Link href={`/admin/tecnologias/${technologySlug}/modulos`}>
            Voltar para Módulos
          </Link>
        </Button>
      </div>
    );
  }

  const posts = await prisma.post.findMany({
    where: { moduleId: module.id },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const data = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status,
    isPublic: p.isPublic,
    order: p.order,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/admin" className="hover:text-blue-500 transition-colors">
              Tecnologias
            </Link>
            <span>/</span>
            <Link
              href={`/admin/tecnologias/${technology.slug}/modulos`}
              className="hover:text-blue-500 transition-colors"
            >
              {technology.name}
            </Link>
            <span>/</span>
            <span>{module.title}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Posts: {module.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os artigos e conteúdos pertencentes a este módulo.
          </p>
        </div>
      </div>

      <PostsTable
        technologyId={technology.id}
        technologySlug={technology.slug}
        moduleId={module.id}
        moduleSlug={moduleSlug}
        data={data}
      />
    </div>
  );
}
