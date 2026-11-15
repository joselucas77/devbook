import type { Metadata } from "next";
import Link from "next/link";
import { HeaderSite } from "@/components/layout/header-site";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "404 - Página não encontrada",
  description: "A página que você tentou acessar não foi encontrada no DevBook.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-clip font-mono">
      {/* Cabeçalho padrão do site com pesquisa e alternador de tema */}
      <HeaderSite />

      {/* Conteúdo central da página 404 */}
      <main className="container mx-auto px-4 py-16 sm:py-24 flex-1 flex flex-col items-center justify-center text-center max-w-xl">
        {/* Badge 404 */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-muted/40 text-xs font-mono text-muted-foreground mb-6 shadow-xs">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Erro 404 • Página não encontrada</span>
        </div>

        {/* Título visual 404 */}
        <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-foreground font-mono mb-2 select-none">
          4<span className="text-primary">0</span>4
        </h1>

        {/* Subtítulo */}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-3">
          Ops! Conteúdo não encontrado
        </h2>

        {/* Descrição amigável */}
        <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          O endereço que você tentou acessar não existe, foi renomeado ou está
          temporariamente indisponível no DevBook.
        </p>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Button asChild size="lg" className="w-full sm:w-auto rounded-xl gap-2 font-mono">
            <Link href="/tecnologias">
              <i className="bx bx-home-alt text-lg" />
              Explorar Tecnologias
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto rounded-xl gap-2 font-mono"
          >
            <Link href="/">
              <i className="bx bx-grid-alt text-lg" />
              Ir para o Início
            </Link>
          </Button>
        </div>

        {/* Dica de Pesquisa */}
        <div className="mt-12 p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs text-xs text-muted-foreground max-w-md w-full shadow-xs">
          <p className="flex items-center justify-center gap-1.5 font-semibold text-foreground mb-1">
            <i className="bx bx-search text-primary text-sm" />
            Dica de navegação
          </p>
          <p>
            Utilize o campo de busca global para pesquisar qualquer tecnologia,
            módulo ou post cadastrado.
          </p>
        </div>
      </main>

      {/* Rodapé padrão */}
      <Footer />
    </div>
  );
}
