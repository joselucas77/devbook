import FeaturedCard from "@/components/app/site/tecnologias/featuredCard";
import { prisma } from "@/lib/prisma";
// e será revalidada (atualizada no banco) em background no máximo a cada 1 hora (3600 segundos).
export const revalidate = 3600;

// ✅ normaliza a chave do ícone com base na categoria salva no banco
function normalizeCategoryKey(category: string) {
  const value = category?.trim().toLowerCase();

  // mapeia variações comuns que você pode salvar no banco
  if (value === "linguagem" || value === "linguagens") return "linguagens";
  if (value === "framework" || value === "frameworks") return "frameworks";
  if (value === "biblioteca" || value === "bibliotecas") return "bibliotecas";
  if (value === "ferramenta" || value === "ferramentas") return "ferramentas";

  // fallback: tenta usar exatamente o que veio
  return value;
}

export default async function Page() {
  const tech = await prisma.technology.findMany({
    orderBy: { updatedAt: "desc" },
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
    <section className="mb-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Tecnologias</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tech.map((item) => {
          const key = normalizeCategoryKey(item.category);

          return (
            <FeaturedCard
              key={item.slug}
              title={item.name}
              image={item.image ?? "/placeholder.svg"}
              category={item.category}
              slug={item.slug}
            />
          );
        })}
      </div>
    </section>
  );
}
