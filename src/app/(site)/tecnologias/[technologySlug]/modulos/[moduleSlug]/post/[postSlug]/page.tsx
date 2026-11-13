import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { CodeBlock } from "@/components/posts/code-block";
import { ParagraphRenderer } from "@/components/posts/paragraph-renderer";
import { formatDatePtBR } from "@/lib/format-date";
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
  const blocks = ((data.content as any)?.blocks as PostContentBlock[]) ?? [];

  return (
    <section className="max-w-3xl mx-auto mb-20">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Link href="/tecnologias" className="hover:text-blue-500 transition-colors">
            {technology.name}
          </Link>
          <span>/</span>
          <Link
            href={`/tecnologias/${technology.slug}/modulos`}
            className="hover:text-blue-500 transition-colors"
          >
            {moduleItem.title}
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 break-words">
          {data.title}
        </h1>

        {data.publishedAt && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <i className="bx bx-calendar text-sm" />
            <span>Publicado em {published}</span>
          </div>
        )}

        {data.image && (
          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-muted/20">
            <img
              src={data.image}
              alt={data.title}
              className="w-full max-h-[420px] object-cover"
            />
          </div>
        )}
      </div>

      <article className="prose prose-invert prose-blue max-w-none">
        {blocks.map((block, index) => {
          switch (block.type) {
            case "heading":
              return block.level === 2 ? (
                <h2 key={index} className="text-2xl font-bold mt-8 mb-4 border-b border-border/40 pb-2">
                  {block.text}
                </h2>
              ) : (
                <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
                  {block.text}
                </h3>
              );

            case "paragraph":
              return <ParagraphRenderer key={index} content={block.content} />;

            case "list":
              return block.style === "numbered" ? (
                <ol key={index} className="list-decimal pl-6 my-4 space-y-1">
                  {block.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ol>
              ) : (
                <ul key={index} className="list-disc pl-6 my-4 space-y-1">
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
        })}
      </article>
    </section>
  );
}
