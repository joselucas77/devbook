"use client";

import { createElement } from "react";
import { BookOpen, Code, Cog, LucideIcon, Wrench } from "lucide-react";
import FeaturedCard from "@/components/app/tecnologias/featuredCard";
import { technologiesMock } from "@/mocks/tecnologias";

const categoryIconMap: Record<string, LucideIcon> = {
  linguagens: Code,
  frameworks: Cog,
  bibliotecas: BookOpen,
  ferramentas: Wrench,
};

export default function Home() {
  const tech = technologiesMock;

  return (
    <section className="mb-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Tecnologias</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tech.map((item) => {
          const IconComponent =
            categoryIconMap[item.category ?? item.category] ?? Code;
          return (
            <FeaturedCard
              key={item.slug}
              title={item.name}
              description={item.description}
              image={item.image}
              date={item.updatedAt.toLocaleDateString("pt-BR")}
              category={item.category}
              icon={createElement(IconComponent, {
                className: "h-5 w-5",
              })}
              slug={item.slug}
            />
          );
        })}
        <FeaturedCard
          title="Laravel"
          description="Explore o Laravel, um framework PHP robusto e elegante, conhecido por sua sintaxe expressiva e ferramentas poderosas que facilitam o desenvolvimento de aplicações web modernas."
          image="https://lh3.googleusercontent.com/pw/AP1GczM2F0FWk-0CqavLBC1uzrYSoLjGUE_KXJACU8BAfQd2CZK0peWIQ1WUZEEq4FMdH7IPKmo9Wp34iDEC3UpkbAaAa0rTJU5LRud8hZ5UNQbKEOLJOrSRJurFT4lIXTbODDcFObEaBVPGjYSc5YCvW1plEg=w1920-h960-s-no-gm?authuser=0"
          date="30/11/2025"
          category="Framework"
          icon={<Cog className="h-5 w-5" />}
          slug="laravel"
        />
        <FeaturedCard
          title="Next.js"
          description="Next.js é um framework React de código aberto que permite funcionalidades como renderização do lado do servidor e geração de sites estáticos para aplicações web baseadas em React."
          image="https://lh3.googleusercontent.com/pw/AP1GczMwNpZn-av3LIC6_m6FO836fSIbPgX9rc0a6s9Sn2X1l3ZUA58JCTi-aYkUdiDI_INU_s6k-yg83usehFQ-fXH1WZr2gi1WhVYOyFqie58JPff1X3_9_jjF7d9XSG8yaztqq83jpn7whhFE7_pRRekGkg=w1455-h970-s-no-gm?authuser=0"
          date="30/11/2025"
          category="Framework"
          icon={<Cog className="h-5 w-5" />}
          slug="nextjs"
        />
      </div>
    </section>
  );
}
