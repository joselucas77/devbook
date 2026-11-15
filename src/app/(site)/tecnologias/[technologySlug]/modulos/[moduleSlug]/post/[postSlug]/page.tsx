import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { CodeBlock } from "@/components/posts/code-block";
import { PostContent } from "@/components/posts/post-content";
import { ParagraphRenderer } from "@/components/posts/paragraph-renderer";
import { ModuleSidebar } from "@/components/posts/module-sidebar";
import { TableOfContents } from "@/components/posts/table-of-contents";
import { MobilePostNav } from "@/components/posts/mobile-post-nav";
import { PostFooterNav } from "@/components/posts/post-footer-nav";
import { formatDatePtBR } from "@/lib/format-date";
import { extractHeadingsAndInjectIds, HeadingItem } from "@/lib/toc";
import { slugifySmart } from "@/lib/slugify";
import { PostContentBlock } from "@/types/post";

export const revalidate = 3600;

export default async function PostPage({
  params,
}: {
  params: Promise<{
    technologySlug: string;
    moduleSlug: string;
    postSlug: string;
  }>;
}) {
  const { technologySlug, moduleSlug, postSlug } = await params;

  const technology = await prisma.technology.findUnique({
    where: { slug: technologySlug },
    select: { id: true, name: true, slug: true },
  });

  if (!technology) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Post não encontrado</h1>
        <p className="text-muted-foreground mb-6">
          A tecnologia solicitada não existe ou foi movida.
        </p>
        <Button asChild>
          <Link href="/tecnologias">Voltar para o catálogo</Link>
        </Button>
      </div>
    );
  }

  const moduleItem = await prisma.module.findUnique({
    where: {
      technologyId_slug: {
        technologyId: technology.id,
        slug: moduleSlug,
      },
    },
    select: { id: true, title: true, slug: true },
  });

  if (!moduleItem) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Post não encontrado</h1>
        <p className="text-muted-foreground mb-6">
          O módulo solicitado não existe ou foi movido.
        </p>
        <Button asChild>
          <Link href={`/tecnologias/${technologySlug}/modulos`}>
            Voltar para os módulos
          </Link>
        </Button>
      </div>
    );
  }

  // Busca todos os posts publicados deste módulo para a navegação
  const modulePosts = await prisma.post.findMany({
    where: {
      moduleId: moduleItem.id,
      isPublic: true,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      slug: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  const data = await prisma.post.findUnique({
    where: {
      moduleId_slug: {
        moduleId: moduleItem.id,
        slug: postSlug,
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      image: true,
      publishedAt: true,
      content: true,
      isPublic: true,
      status: true,
    },
  });

  const canShow = data && data.isPublic && data.status === "PUBLISHED";

  if (!canShow) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Post não encontrado</h1>
        <p className="text-muted-foreground mb-6">
          O artigo solicitado não está disponível publicamente.
        </p>
        <Button asChild>
          <Link href={`/tecnologias/${technologySlug}/modulos`}>
            Voltar para os módulos
          </Link>
        </Button>
      </div>
    );
  }

  const published = data.publishedAt ? formatDatePtBR(data.publishedAt) : "";
  const contentObj = data.content as Record<string, unknown> | null;
  const htmlContent =
    typeof contentObj?.html === "string" && contentObj.html.trim()
      ? contentObj.html
      : null;
  const blocks = Array.isArray(contentObj?.blocks)
    ? (contentObj.blocks as PostContentBlock[])
    : [];

  // Extrai títulos e injeta IDs de âncora no HTML
  let headings: HeadingItem[] = [];
  let contentHtmlToRender = htmlContent || "";

  if (htmlContent) {
    const extracted = extractHeadingsAndInjectIds(htmlContent);
    headings = extracted.headings;
    contentHtmlToRender = extracted.modifiedHtml;
  } else if (blocks.length > 0) {
    headings = blocks
      .filter(
        (b): b is Extract<PostContentBlock, { type: "heading" }> =>
          b.type === "heading" && (b.level === 2 || b.level === 3)
      )
      .map((b, idx) => ({
        id: slugifySmart(b.text || `secao-${idx + 1}`),
        text: b.text || "",
        level: b.level || 2,
      }));
  }

  // Determina post anterior e próximo
  const currentIndex = modulePosts.findIndex((p) => p.slug === postSlug);
  const prevPost = currentIndex > 0 ? modulePosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex >= 0 && currentIndex < modulePosts.length - 1
      ? modulePosts[currentIndex + 1]
      : null;

  return (
    <div className="w-full max-w-7xl mx-auto pb-4 md:pb-6 min-w-0">
      {/* Barra Responsiva (Mobile e Tablet): Abertura da Gaveta de Posts + Sumário */}
      <MobilePostNav
        technologySlug={technology.slug}
        technologyName={technology.name}
        moduleSlug={moduleItem.slug}
        moduleTitle={moduleItem.title}
        posts={modulePosts}
        currentPostSlug={data.slug}
        headings={headings}
      />

      {/* Grid de 3 Colunas no Desktop */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start w-full max-w-full min-w-0">
        {/* COLUNA 1 (Esquerda - Navegação do Módulo): Fixa no Desktop */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-3 scrollbar-thin">
          <ModuleSidebar
            technologySlug={technology.slug}
            technologyName={technology.name}
            moduleSlug={moduleItem.slug}
            moduleTitle={moduleItem.title}
            posts={modulePosts}
            currentPostSlug={data.slug}
          />
        </aside>

        {/* COLUNA 2 (Centro - Conteúdo Principal do Artigo) */}
        <main className="min-w-0 flex-1 max-w-3xl mx-auto px-0 sm:px-3 w-full">
          {/* Breadcrumb discreto */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Link
              href="/tecnologias"
              className="hover:text-primary transition-colors"
            >
              Tecnologias
            </Link>
            <span>/</span>
            <Link
              href={`/tecnologias/${technology.slug}/modulos`}
              className="hover:text-primary transition-colors"
            >
              {technology.name}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {moduleItem.title}
            </span>
          </div>

          {/* Título do Post */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-3 text-foreground break-words">
            {data.title}
          </h1>

          {/* Data de publicação */}
          {data.publishedAt && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
              <i className="bx bx-calendar text-sm" />
              <span>Publicado em {published}</span>
            </div>
          )}

          {/* Imagem de Capa (se houver) */}
          {data.image && (
            <div className="mb-8 overflow-hidden rounded-xl border border-border bg-muted/20">
              <img
                src={data.image}
                alt={data.title}
                className="w-full max-h-[420px] object-cover"
              />
            </div>
          )}

          {/* Artigo / Conteúdo */}
          <article className="prose dark:prose-invert prose-blue max-w-none w-full min-w-0">
            {htmlContent ? (
              <PostContent html={contentHtmlToRender} />
            ) : (
              blocks.map((block, index) => {
                switch (block.type) {
                  case "heading": {
                    const headingId = slugifySmart(block.text || `secao-${index + 1}`);
                    return block.level === 2 ? (
                      <h2
                        key={index}
                        id={headingId}
                        className="scroll-mt-24 text-2xl font-bold mt-8 mb-4 border-b border-border/40 pb-2"
                      >
                        {block.text}
                      </h2>
                    ) : (
                      <h3
                        key={index}
                        id={headingId}
                        className="scroll-mt-24 text-xl font-semibold mt-6 mb-3"
                      >
                        {block.text}
                      </h3>
                    );
                  }

                  case "paragraph":
                    return (
                      <ParagraphRenderer
                        key={index}
                        content={block.content}
                      />
                    );

                  case "list":
                    return block.style === "numbered" ? (
                      <ol
                        key={index}
                        className="list-decimal pl-6 my-4 space-y-1"
                      >
                        {block.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ol>
                    ) : (
                      <ul
                        key={index}
                        className="list-disc pl-6 my-4 space-y-1"
                      >
                        {block.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    );

                  case "code":
                    return (
                      <div key={index}>
                        <CodeBlock
                          code={block.code}
                          language={block.language ?? "txt"}
                          filename={block.filename ?? "index.html"}
                        />
                        {block.explanation ? (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            {block.explanation}
                          </p>
                        ) : null}
                      </div>
                    );

                  case "summary":
                    return (
                      <div
                        key={index}
                        className="my-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-200"
                      >
                        <strong className="block text-blue-400 font-semibold mb-1">
                          Resumo
                        </strong>
                        <p className="text-sm">{block.text}</p>
                      </div>
                    );

                  default:
                    return null;
                }
              })
            )}
          </article>

          {/* Navegação de Rodapé (Post Anterior / Próximo Post) */}
          <PostFooterNav
            technologySlug={technology.slug}
            moduleSlug={moduleItem.slug}
            prevPost={prevPost}
            nextPost={nextPost}
          />
        </main>

        {/* COLUNA 3 (Direita - Sumário "Nesta Página"): Fixa no Desktop */}
        <aside className="hidden xl:block w-56 shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pl-3 border-l border-border/40 scrollbar-thin">
          <TableOfContents headings={headings} />
        </aside>
      </div>
    </div>
  );
}
