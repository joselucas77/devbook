import { prisma } from "@/lib/prisma";
import { TechnologiesTable } from "./technologies-table";

export default async function AdminTechnologiesPage() {
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
    <main className="container mx-auto px-4 py-12">
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Tecnologias
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Visualize, crie e edite tecnologias. Acesse módulos por aqui.
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
      </section>
    </main>
  );
}
