import { createElement } from "react";
import { BookOpen, Code, Cog, LucideIcon, Wrench } from "lucide-react";
import FeaturedCard from "@/components/app/site/tecnologias/featuredCard";
import { prisma } from "@/lib/prisma";

const categoryIconMap: Record<string, LucideIcon> = {
  linguagens: Code,
  frameworks: Cog,
  bibliotecas: BookOpen,
  ferramentas: Wrench,
};

// ✅ formata no server p/ evitar hydration mismatch no client
function formatDatePtBR(date: Date) {
  // usa um timezone fixo pra não depender de ambiente/server
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Maceio",
  });
  return fmt.format(date);
}

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
      description: true,
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
          const IconComponent = categoryIconMap[key] ?? Code;

          return (
            <FeaturedCard
              key={item.slug}
              title={item.name}
              description={item.description}
              image={item.image ?? "/placeholder.svg"}
              date={formatDatePtBR(item.updatedAt)}
              category={item.category}
              icon={createElement(IconComponent, { className: "h-5 w-5" })}
              slug={item.slug}
            />
          );
        })}
      </div>
    </section>
  );
}
