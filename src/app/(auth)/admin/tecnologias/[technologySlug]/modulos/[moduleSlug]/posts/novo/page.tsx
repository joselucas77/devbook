import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostForm } from "./post-form";
import { Button } from "@/components/ui/button";

export default async function AdminNewPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ technologySlug: string; moduleSlug: string }>;
  searchParams: Promise<{ moduleId?: string; edit?: string }>;
}) {
  const { technologySlug, moduleSlug } = await params;
  const { moduleId: moduleIdParam, edit: editParam } = await searchParams;

  const editId = editParam ? Number(editParam) : null;
  const moduleIdFromQuery = moduleIdParam ? Number(moduleIdParam) : null;

  const post = editId
    ? await prisma.post.findUnique({
        where: { id: editId },
        include: { module: { include: { technology: true } } },
      })
    : null;

  const resolvedModuleId = post?.moduleId ?? moduleIdFromQuery;

  let module = null;
  if (resolvedModuleId) {
    module = await prisma.module.findUnique({
      where: { id: resolvedModuleId },
      include: { technology: true },
    });
  } else if (moduleSlug && technologySlug) {
    const tech = await prisma.technology.findUnique({
      where: { slug: technologySlug },
    });
    if (tech) {
      module = await prisma.module.findFirst({
        where: { slug: moduleSlug, technologyId: tech.id },
        include: { technology: true },
      });
    }
  }

  if (!module) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-muted-foreground">
          Módulo não encontrado ou não informado.
        </p>
        <Button asChild variant="outline">
          <Link href="/admin">Voltar para Tecnologias</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-6">
      <PostForm
        moduleId={module.id}
        technologyId={module.technologyId}
        technologySlug={module.technology.slug}
        technologyName={module.technology.name}
        moduleSlug={module.slug}
        moduleTitle={module.title}
        initialPost={
          post
            ? {
                id: post.id,
                title: post.title,
                slug: post.slug,
                concept: post.concept,
                summary: post.summary,
                image: post.image,
                isPublic: post.isPublic,
                status: post.status,
                content: {
                  blocks: Array.isArray((post.content as any)?.blocks)
                    ? (post.content as any).blocks
                    : Array.isArray(post.content)
                    ? post.content
                    : [],
                },
              }
            : null
        }
      />
    </div>
  );
}
