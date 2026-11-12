import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { ModuleFolder } from "@/components/modules/module-folder";

export const revalidate = 3600;

export default async function ModulosPage({
  params,
}: {
  params: Promise<{ technologySlug: string }>;
}) {
  const { technologySlug: slug } = await params;

  const technology = await prisma.technology.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      description: true,
      modules: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          posts: {
            where: { isPublic: true, status: "PUBLISHED" },
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!technology) {
    return (
      <div className="text-center py-20">
        <i className="bx bx-error-circle text-5xl text-muted-foreground mb-3" />
        <h1 className="text-2xl font-bold text-foreground">
          Tecnologia não encontrada
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          A tecnologia solicitada não existe ou foi removida.
        </p>
        <Link
          href="/tecnologias"
          className="text-blue-500 hover:underline mt-4 inline-block text-sm"
        >
          Voltar para o catálogo
        </Link>
      </div>
    );
  }

  const totalTopics = technology.modules.reduce(
    (acc, mod) => acc + mod.posts.length,
    0
  );

  return (
    <section className="max-w-3xl mx-auto mb-20">
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            {technology.name}
          </h1>
        </div>

        <p className="text-muted-foreground max-w-2xl mb-6 leading-relaxed">
          {technology.description}
        </p>

        <div className="w-full flex flex-wrap items-center justify-between gap-4 py-2 border-y border-border/40">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <i className="bx bx-layer text-lg" />
              <span>{technology.modules.length} módulos</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <i className="bx bx-book-open text-lg" />
              <span>{totalTopics} posts publicados</span>
            </div>
          </div>

          <Badge variant="outline" className="gap-1">
            <i className="bx bx-tag text-xs" />
            {technology.category}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1">
        {technology.modules.map((mod) => (
          <ModuleFolder
            key={mod.id}
            technologySlug={technology.slug}
            moduleTitle={mod.title}
            moduleSlug={mod.slug}
            posts={mod.posts}
          />
        ))}

        {technology.modules.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-lg border-border">
            <i className="bx bx-folder-open text-4xl text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">
              Nenhum módulo cadastrado nesta tecnologia ainda.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
