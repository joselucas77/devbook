"use client";

import Link from "next/link";
import { Code, Cog, Eye } from "lucide-react";
import FeaturedCard from "@/components/app/tecnologias/featuredCard";
import { useEffect, useState } from "react";
import FeaturedCardSkeleton from "@/components/app/tecnologias/featuredCardSkeleton";

export default function Home() {
  // Emular um loading inicial de busca de dados para demomstração do skeleton
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Simula um loading de 1 segundo
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="mb-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Nossos Destaques</h2>
        <Link
          href="/tecnologias"
          className="text-blue-500 hover:text-blue-400 text-sm flex items-center gap-2"
        >
          Ver tudo <Eye className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <FeaturedCard
          title="PHP"
          description="O PHP (sigla recursiva para PHP: Hypertext Preprocessor) é uma linguagem de script open source (código aberto) de uso geral, mas criada especialmente para o desenvolvimento web."
          image="https://lh3.googleusercontent.com/pw/AP1GczOCw36SEx7Y9OdUYyE9jVHRIv5wYgVFdFpfVGUirzJqdNSEMZ0YceQtG9FZZQ63W8dmI6vdqvTYgl69xrk3ieYMXIxA2Zyb_RC4Nkca8b1ob78Ku2Z-95KtNMT2x0aWy9yJ7DhvnMd3Q-oNCmIuwdJuPA=w1455-h970-s-no-gm?authuser=0"
          date="30/11/2025"
          category="Linguagem"
          icon={<Code className="h-5 w-5" />}
          slug="php"
        />
        {isLoading ? (
          <FeaturedCardSkeleton />
        ) : (
          <FeaturedCard
            title="Laravel"
            description="Explore o Laravel, um framework PHP robusto e elegante, conhecido por sua sintaxe expressiva e ferramentas poderosas que facilitam o desenvolvimento de aplicações web modernas."
            image="https://lh3.googleusercontent.com/pw/AP1GczM2F0FWk-0CqavLBC1uzrYSoLjGUE_KXJACU8BAfQd2CZK0peWIQ1WUZEEq4FMdH7IPKmo9Wp34iDEC3UpkbAaAa0rTJU5LRud8hZ5UNQbKEOLJOrSRJurFT4lIXTbODDcFObEaBVPGjYSc5YCvW1plEg=w1920-h960-s-no-gm?authuser=0"
            date="30/11/2025"
            category="Framework"
            icon={<Cog className="h-5 w-5" />}
            slug="laravel"
          />
        )}
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
