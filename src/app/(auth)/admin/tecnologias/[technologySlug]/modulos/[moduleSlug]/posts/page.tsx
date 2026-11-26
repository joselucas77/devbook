import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostsTable } from "./posts-table";
import { Button } from "@/components/ui/button";
import { publishDueScheduledPosts } from "@/lib/publish-scheduled";

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
          <Link href="/admin/tecnologias">Voltar para Tecnologias</Link>
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

  await publishDueScheduledPosts();

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
    scheduledFor: p.scheduledFor ? p.scheduledFor.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button
          asChild
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full shrink-0 mt-0.5"
          aria-label="Voltar para Módulos"
          title="Voltar para Módulos"
        >
          <Link href={`/admin/tecnologias/${technology.slug}/modulos`}>
            <i className="bx bx-arrow-back text-lg" />
          </Link>
        </Button>

        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight break-words">
            {module.title}
          </h1>
          <p className="hidden md:block text-sm text-muted-foreground mt-1">
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
