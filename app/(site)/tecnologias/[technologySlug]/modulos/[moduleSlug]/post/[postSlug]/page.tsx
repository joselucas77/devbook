"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { postsByModuleListMock } from "@/mocks/post";
import { CodeBlock } from "@/components/app/site/post/codeBock";

type ContentBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; style: "bullet" | "numbered"; items: string[] }
  | {
      type: "code";
      language?: string;
      filename?: string;
      code: string;
      highlightLines?: number[];
      explanation?: string;
    }
  | { type: "summary"; text: string };

export default function Page() {
  const params = useParams<{ postSlug: string }>();
  const slug = params.postSlug;

  const data = postsByModuleListMock.find((item) => item.slug === slug);

  const router = useRouter();

  useEffect(() => {
    if (!data) {
      toast.error("Post não encontrado", {
        description: "O post que você está tentando acessar não existe.",
      });
    }
  }, [data]);

  if (!data) {
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
  const published = data.publishedAt ? new Date(data.publishedAt) : "";

  const blocks: ContentBlock[] = (data as any)?.content?.blocks ?? [];

  return (
    <section className="max-w-3xl mx-auto mb-20">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-2">
        {data.title}
      </h1>

      {data.publishedAt && (
        <div className="flex items-center gap-1 text-sm text-gray-400 mb-8">
          <Calendar className="w-4 h-4" />{" "}
          <span>{published ? published.toLocaleDateString() : ""}</span>
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
              return <p key={index}>{block.text}</p>;

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
                    highlightLines={block.highlightLines}
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
