"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { postsByModuleListMock } from "@/mocks/post";
import { CodeBlock } from "@/components/app/post/codeBock";

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
  }, [data, toast]);

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

  return (
    <section className="max-w-3xl mx-auto mb-20">
      <Button
        variant="link"
        onClick={() => router.back()}
        className="inline-flex items-center text-gray-400 hover:text-white mb-8"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para os módulos
      </Button>

      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-2">
        {data.title}
      </h1>

      {data.publishedAt && (
        <div className="flex items-center gap-1 text-sm text-gray-400 mb-8">
          <Calendar className="w-4 h-4" />{" "}
          <span>{data.publishedAt.toLocaleDateString()}</span>
        </div>
      )}

      <article className="prose prose-invert prose-purple max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // inline code: `isso aqui`
            code({ children, className, ...props }) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },

            // blocos de código: ```php ... ```
            pre({ children }) {
              const child = children as any;
              const codeElement = Array.isArray(child) ? child[0] : child;

              const codeText = String(
                codeElement?.props?.children || ""
              ).replace(/\n$/, "");

              const className = codeElement?.props?.className || "";
              const match = /language-(\w+)/.exec(className);
              const language = match?.[1] ?? "txt";

              return (
                <CodeBlock
                  code={codeText}
                  language={language}
                  // se quiser, pode passar um filename fixo ou vindo do post
                  // filename={`${data.slug}.php`}
                />
              );
            },
          }}
        >
          {data.content ?? ""}
        </ReactMarkdown>
      </article>
    </section>
  );
}
