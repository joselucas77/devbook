import { prisma } from "@/lib/prisma";
import { ModulesTable } from "./modules-table";

export default async function Page({
  params,
}: {
  params: Promise<{ technologyId: string }>;
}) {
  const { technologyId: technologyIdParam } = await params;
  const technologyId = Number(technologyIdParam);

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

  const modules = await prisma.module.findMany({
    where: { technologyId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { posts: true } },
    },
  });

  return (
    <main className="container mx-auto px-4 py-12">
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Módulos
            </h1>
            <p className="text-sm text-gray-400">
              Tecnologia:{" "}
              <span className="text-zinc-200 font-medium">
                {technology.name}
              </span>
            </p>
          </div>
        </div>

        <ModulesTable
          technologyId={technology.id}
          technologyName={technology.name}
          data={modules.map((m) => ({
            id: m.id,
            title: m.title,
            slug: m.slug,
            technologyId,
            postsCount: m._count.posts,
            createdAt: m.createdAt.toISOString(),
            updatedAt: m.updatedAt.toISOString(),
          }))}
        />
      </section>
    </main>
  );
}
