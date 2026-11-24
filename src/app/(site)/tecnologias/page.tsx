import type { Metadata } from "next";
import { FeaturedCard } from "@/components/technologies/featured-card";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Catálogo de Tecnologias",
  description:
    "Explore guias práticos, conceitos e documentações das principais tecnologias modernas de desenvolvimento de software.",
  openGraph: {
    title: "Catálogo de Tecnologias | DevBook",
    description:
      "Explore guias práticos, conceitos e documentações das principais tecnologias modernas de desenvolvimento de software.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Catálogo de Tecnologias | DevBook",
    description:
      "Explore guias práticos, conceitos e documentações das principais tecnologias modernas.",
  },
};

export default async function TecnologiasPage() {
  const tech = await prisma.technology.findMany({
    where: { isArchived: false },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      category: true,
      updatedAt: true,
    },
  });

  return (
    <section className="mb-20 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tecnologias</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Explore documentações, conceitos e referências por tecnologia.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {tech.map((item, index) => (
          <FeaturedCard
            key={item.slug}
            title={item.name}
            image={item.image ?? "/placeholder.svg"}
            category={item.category}
            slug={item.slug}
            priority={index < 4}
          />
        ))}
      </div>

      {tech.length === 0 && (
        <div className="text-center py-16 border border-dashed rounded-lg border-border">
          <i className="bx bx-code-alt text-4xl text-muted-foreground mb-2" />
          <h3 className="font-semibold text-lg text-foreground">
            Nenhuma tecnologia cadastrada
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            As tecnologias cadastradas aparecerão aqui.
          </p>
        </div>
      )}
    </section>
  );
}
