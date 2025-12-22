import { prisma } from "@/lib/prisma";
import { PostsTable } from "./posts-table";

export default async function Page({
  params,
}: {
  params: Promise<{ moduleId: string; technologyId: string }>;
}) {
  const { moduleId: moduleIdParam, technologyId: technologyIdParam } =
    await params;
  const moduleId = Number(moduleIdParam);
  const technologyId = Number(technologyIdParam);

  if (!Number.isFinite(moduleId)) {
    return (
      <main className="container mx-auto px-4 py-12">
        <section className="max-w-5xl mx-auto">
          <p className="text-gray-400">ID de módulo inválido.</p>
        </section>
      </main>
    );
  }

  if (!Number.isFinite(technologyId)) {
    return (
      <main className="container mx-auto px-4 py-12">
        <section className="max-w-5xl mx-auto">
          <p className="text-gray-400">ID de tecnologia inválido.</p>
        </section>
      </main>
    );
  }

  const technology = await prisma.technology.findUnique({
    where: { id: technologyId },
    select: { id: true, name: true, slug: true },
  });

  if (!technology) {
    return (
      <main className="container mx-auto px-4 py-12">
        <section className="max-w-5xl mx-auto">
          <p className="text-gray-400">Tecnologia não encontrada.</p>
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
        <p className="text-gray-400">Módulo não encontrado.</p>
      </main>
    );
  }

  const posts = await prisma.post.findMany({
    where: { moduleId },
    orderBy: { createdAt: "desc" },
  });

  const data = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status,
    isPublic: p.isPublic,
    createdAt: p.createdAt,
  }));

  return (
    <main className="container mx-auto px-4 py-12">
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Posts
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              {module.technology.name} / {module.title}
            </p>
          </div>
        </div>

        <PostsTable
          technologyId={technologyId}
          tecnologySlug={technology.slug}
          moduleSlug={module.slug}
          moduleId={moduleId}
          data={data}
        />
      </section>
    </main>
  );
}
