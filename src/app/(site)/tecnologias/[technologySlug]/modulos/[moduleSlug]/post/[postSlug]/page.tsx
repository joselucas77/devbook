import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { CodeBlock } from "@/components/posts/code-block";
import { PostContent } from "@/components/posts/post-content";
import { ParagraphRenderer } from "@/components/posts/paragraph-renderer";
import { ModuleSidebar } from "@/components/posts/module-sidebar";
import { TableOfContents } from "@/components/posts/table-of-contents";
import { MobilePostNav } from "@/components/posts/mobile-post-nav";
import { PostFooterNav } from "@/components/posts/post-footer-nav";
import { PostScrollReset } from "@/components/posts/post-scroll-reset";
import { formatDatePtBR } from "@/lib/format-date";
import { extractHeadingsAndInjectIds, HeadingItem } from "@/lib/toc";
import { slugifySmart } from "@/lib/slugify";
import { PostContentBlock } from "@/types/post";
import { parsePostHtmlServer } from "@/lib/parse-post-html";
import { highlightCode } from "@/lib/shiki";
import type { PostNavItem } from "@/components/posts/post-footer-nav";
import {
  BookmarkButton,
  MarkAsReadCard,
} from "@/components/posts/post-actions";
import { calculateReadingTime } from "@/lib/reading-time";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    technologySlug: string;
    moduleSlug: string;
    postSlug: string;
  }>;
}): Promise<Metadata> {
  const { technologySlug, moduleSlug, postSlug } = await params;

  try {
    const post = await prisma.post.findFirst({
      where: {
        slug: postSlug,
        module: {
          slug: moduleSlug,
          technology: { slug: technologySlug, isArchived: false },
        },
      },
      select: {
        title: true,
        summary: true,
        concept: true,
        image: true,
        publishedAt: true,
        module: {
          select: {
            title: true,
            technology: { select: { name: true } },
          },
        },
      },
    });

    if (!post) {
      return {
        title: "Post não encontrado",
      };
    }

    const description =
      post.summary ||
      post.concept ||
      `Artigo sobre ${post.title} no módulo ${post.module.title} (${post.module.technology.name}).`;

    return {
      title: `${post.title} | ${post.module.technology.name}`,
      description,
      openGraph: {
        title: `${post.title} | ${post.module.technology.name} - DevBook`,
        description,
        type: "article",
        publishedTime: post.publishedAt?.toISOString(),
        images: post.image ? [{ url: post.image, alt: post.title }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${post.title} | ${post.module.technology.name}`,
        description,
        images: post.image ? [post.image] : [],
      },
    };
  } catch (error) {
    console.error("Erro ao gerar metadados do post:", error);
    return {
      title: "Artigo | DevBook",
    };
  }
}

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

  const technology = await prisma.technology.findFirst({
    where: { slug: technologySlug, isArchived: false },
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
    select: { id: true, title: true, slug: true, order: true },
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
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
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

  // Determina post anterior e próximo (dentro do módulo ou navegando entre módulos)
  const currentIndex = modulePosts.findIndex((p) => p.slug === postSlug);
  let prevNav: PostNavItem | null = null;
  let nextNav: PostNavItem | null = null;

  if (currentIndex > 0) {
    prevNav = {
      title: modulePosts[currentIndex - 1].title,
      slug: modulePosts[currentIndex - 1].slug,
      moduleSlug: moduleItem.slug,
    };
  } else {
    // Busca o post anterior no módulo anterior da tecnologia
    const prevModule = await prisma.module.findFirst({
      where: {
        technologyId: technology.id,
        order: { lt: moduleItem.order },
      },
      orderBy: { order: "desc" },
      select: {
        title: true,
        slug: true,
        posts: {
          where: { isPublic: true, status: "PUBLISHED" },
          orderBy: [{ order: "desc" }, { createdAt: "desc" }],
          take: 1,
          select: { title: true, slug: true },
        },
      },
    });
    if (prevModule && prevModule.posts[0]) {
      prevNav = {
        title: prevModule.posts[0].title,
        slug: prevModule.posts[0].slug,
        moduleSlug: prevModule.slug,
        moduleTitle: prevModule.title,
      };
    }
  }

  if (currentIndex >= 0 && currentIndex < modulePosts.length - 1) {
    nextNav = {
      title: modulePosts[currentIndex + 1].title,
      slug: modulePosts[currentIndex + 1].slug,
      moduleSlug: moduleItem.slug,
    };
  } else {
    // Busca o primeiro post do próximo módulo da tecnologia
    const nextModule = await prisma.module.findFirst({
      where: {
        technologyId: technology.id,
        order: { gt: moduleItem.order },
      },
      orderBy: { order: "asc" },
      select: {
        title: true,
        slug: true,
        posts: {
          where: { isPublic: true, status: "PUBLISHED" },
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          take: 1,
          select: { title: true, slug: true },
        },
      },
    });
    if (nextModule && nextModule.posts[0]) {
      nextNav = {
        title: nextModule.posts[0].title,
        slug: nextModule.posts[0].slug,
        moduleSlug: nextModule.slug,
        moduleTitle: nextModule.title,
      };
    }
  }

  // Prepara os segmentos com realce de sintaxe Shiki no servidor
  const postSegments = contentHtmlToRender
    ? await parsePostHtmlServer(contentHtmlToRender)
    : [];

  // Se o post usar o formato de blocos estruturados, pré-processa os códigos com Shiki
  const highlightedBlocks = await Promise.all(
    blocks.map(async (block) => {
      if (block.type === "code") {
        const highlighted = await highlightCode(block.code, block.language);
        return { ...block, highlightedHtml: highlighted };
      }
      return block;
    })
  );

  return (
    <div className="w-full max-w-7xl mx-auto pb-4 md:pb-6 min-w-0">
      {/* Reseta o scroll para o topo ao trocar de post */}
      <PostScrollReset />

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
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mb-4 min-w-0">
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

          {/* Título do Post & Ações */}
          <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-foreground break-words min-w-0 flex-1">
              {data.title}
            </h1>
            <BookmarkButton
              post={{
                postId: data.id,
                slug: data.slug,
                title: data.title,
                technologySlug: technology.slug,
                technologyName: technology.name,
                moduleSlug: moduleItem.slug,
                moduleTitle: moduleItem.title,
              }}
            />
          </div>

          {/* Data de publicação & Tempo de Leitura */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-6">
            {data.publishedAt && (
              <div className="flex items-center gap-1.5">
                <i className="bx bx-calendar text-sm" />
                <span>Publicado em {published}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <i className="bx bx-time-five text-sm text-blue-400" />
              <span>
                {calculateReadingTime(
                  contentHtmlToRender ||
                    blocks.map((b) => ("text" in b ? b.text : "")).join(" ")
                )}{" "}
                min de leitura
              </span>
            </div>
          </div>

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
              <PostContent
                segments={postSegments}
                html={contentHtmlToRender}
              />
            ) : (
              highlightedBlocks.map((block, index) => {
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
                          highlightedHtml={block.highlightedHtml}
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

          {/* Marcar como lido / Progresso do módulo */}
          <MarkAsReadCard postSlug={data.slug} />

          {/* Navegação de Rodapé (Post Anterior / Próximo Post contínuo entre módulos) */}
          <PostFooterNav
            technologySlug={technology.slug}
            prevNav={prevNav}
            nextNav={nextNav}
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
