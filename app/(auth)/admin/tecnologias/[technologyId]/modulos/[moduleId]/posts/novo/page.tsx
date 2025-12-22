import { prisma } from "@/lib/prisma";
import { PostForm } from "./post-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ moduleId: string; edit?: string }>;
}) {
  const { moduleId: moduleIdParam, edit: editParam } = await searchParams;
  const editId = editParam ? Number(editParam) : null;
  const moduleIdFromQuery = moduleIdParam ? Number(moduleIdParam) : null;

  // Se for editar, o moduleId vem do próprio post
  const post = editId
    ? await prisma.post.findUnique({
        where: { id: editId },
        include: { module: { include: { technology: true } } },
      })
    : null;

  const moduleId = post?.moduleId ?? moduleIdFromQuery;

  if (!moduleId) {
    return (
      <main className="container mx-auto px-4 py-12">
        <section className="max-w-3xl mx-auto">
          <p className="text-gray-400">
            moduleId não informado. Acesse esta tela pelo fluxo:
            <br />
            <span className="text-zinc-200">
              /admin/tecnologias/.../modulos/.../posts → Novo post
            </span>
          </p>
        </section>
      </main>
    );
  }

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { technology: true },
  });

  if (!module) {
    return (
      <main className="container mx-auto px-4 py-12">
        <section className="max-w-3xl mx-auto">
          <p className="text-gray-400">Módulo não encontrado.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <PostForm
        moduleId={module.id}
        technologyId={module.technologyId}
        technologyName={module.technology.name}
        moduleTitle={module.title}
        initialPost={
          post
            ? {
                id: post.id,
                title: post.title,
                slug: post.slug,
                concept: post.concept,
                summary: post.summary,
                isPublic: post.isPublic,
                status: post.status,
                content: post.content as any, // Json → seu PostContent
              }
            : null
        }
      />
    </main>
  );
}
