import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TechnologiesTable } from "../technologies-table";

export const metadata = {
  title: "Tecnologias | Painel DevBook",
};

export default async function AdminTechnologiesPage() {
  const technologies = await prisma.technology.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      description: true,
      image: true,
      order: true,
      isArchived: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { modules: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mb-1">
          <Link href="/admin" className="hover:text-blue-500 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span>Tecnologias</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Tecnologias
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visualize, crie e edite tecnologias e acesse seus módulos e posts.
        </p>
      </div>

      <TechnologiesTable
        data={technologies.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          category: t.category,
          description: t.description,
          image: t.image,
          order: t.order,
          isArchived: t.isArchived,
          modulesCount: t._count.modules,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
