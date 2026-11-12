import { prisma } from "@/lib/prisma";
import { TechnologiesTable } from "./technologies-table";

export const metadata = {
  title: "Tecnologias | Painel DevBook",
};

export default async function AdminPage() {
  const technologies = await prisma.technology.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      description: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { modules: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Tecnologias
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize, crie e edite tecnologias e acesse seus módulos e posts.
          </p>
        </div>
      </div>

      <TechnologiesTable
        data={technologies.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          category: t.category,
          description: t.description,
          image: t.image,
          modulesCount: t._count.modules,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
