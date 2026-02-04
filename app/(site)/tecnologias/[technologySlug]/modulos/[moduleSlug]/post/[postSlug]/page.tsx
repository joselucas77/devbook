import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CodeBlock } from "@/components/app/site/post/codeBock";
import { formatDatePtBR } from "@/lib/formatDate";
import { ParagraphRenderer } from "@/components/app/auth/admin/post/ParagraphRenderer";
import { PostContentBlock } from "@/types/globalTypes";

type ContentBlock = PostContentBlock;

export default async function Page({
  params,
}: {
  params: Promise<{
    technologySlug: string;
    moduleSlug: string;
    postSlug: string;
  }>;
}) {
  const { technologySlug, moduleSlug, postSlug } = await params;

  // 1) acha a tecnologia
  const technology = await prisma.technology.findUnique({
    where: { slug: technologySlug },
    select: { id: true },
  });

  if (!technology) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Post não encontrado</h1>
          <p className="mb-6">
            O post que você está tentando acessar não existe ou foi movido.
          </p>
          <Button asChild>
            <Link href="/">Voltar para a página inicial</Link>
          </Button>
        </div>
      </main>
    );
  }

  // 2) acha o módulo dentro da tecnologia
  const moduleItem = await prisma.module.findUnique({
    where: {
      technologyId_slug: {
        technologyId: technology.id,
        slug: moduleSlug,
      },
    },
    select: { id: true },
  });

  if (!moduleItem) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Post não encontrado</h1>
          <p className="mb-6">
            O post que você está tentando acessar não existe ou foi movido.
          </p>
          <Button asChild>
            <Link href="/">Voltar para a página inicial</Link>
          </Button>
        </div>
      </main>
    );
  }

  // 3) acha o post pelo slug + moduleId
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
      publishedAt: true,
      content: true,
      isPublic: true,
      status: true,
    },
  });

  console.log("Post data:", data);

  // Regra para público: só mostra publicados e públicos
  const canShow = data && data.isPublic && data.status === "PUBLISHED";

  if (!canShow) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Post não encontrado</h1>
          <p className="mb-6">
            O post que você está tentando acessar não existe ou foi movido.
          </p>
          <Button asChild>
            <Link href="/">Voltar para a página inicial</Link>
          </Button>
        </div>
      </main>
    );
  }

  const published = data.publishedAt ? formatDatePtBR(data.publishedAt) : "";

  const blocks = (data.content as ContentBlock[]) ?? [];

  return (
    <section className="max-w-3xl mx-auto mb-20">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-2">
        {data.title}
      </h1>

      {data.publishedAt && (
        <div className="flex items-center gap-1 text-sm text-gray-400 mb-8">
          <Calendar className="w-4 h-4" /> <span>{published}</span>
        </div>
      )}

      <article className="prose prose-invert prose-purple max-w-none">
        {blocks.map((block, index) => {
          switch (block.type) {
            case "heading":
              return block.level === 2 ? (
                <h2 key={index}>{block.text}</h2>
              ) : (
                <h3 key={index}>{block.text}</h3>
              );

            case "paragraph":
              return <ParagraphRenderer key={index} content={block.content} />;
            // case "paragraph":
            //   return <ParagraphRenderer key={index} content={block.content} />;
            case "list":
              return block.style === "numbered" ? (
                <ol key={index}>
                  {block.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ol>
              ) : (
                <ul key={index}>
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
                  {block.explanation ? <p>{block.explanation}</p> : null}
                </div>
              );

            case "summary":
              return (
                <p key={index} className="font-semibold">
                  {block.text}
                </p>
              );

            default:
              return null;
          }
        })}
      </article>
    </section>
  );
}
