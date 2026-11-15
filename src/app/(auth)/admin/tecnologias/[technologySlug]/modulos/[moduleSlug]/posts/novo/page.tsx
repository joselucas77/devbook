import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostForm } from "./post-form";
import { Button } from "@/components/ui/button";

function convertLegacyBlocksToHtml(blocks: unknown[]): string {
  if (!Array.isArray(blocks) || blocks.length === 0) return "";
  return blocks
    .map((item) => {
      const b = item as Record<string, unknown>;
      if (b.type === "heading") {
        const lvl = typeof b.level === "number" ? b.level : 2;
        return `<h${lvl}>${String(b.text ?? "")}</h${lvl}>`;
      }
      if (b.type === "paragraph") {
        if (typeof b.text === "string") return `<p>${b.text}</p>`;
        const content = b.content as Record<string, unknown> | undefined;
        if (Array.isArray(content?.children)) {
          const inner = content.children
            .map((nodeItem: unknown) => {
              const node = nodeItem as Record<string, unknown>;
              if (node.type === "code") return `<code>${String(node.text ?? "")}</code>`;
              if (node.type === "quote") return `<blockquote>${String(node.text ?? "")}</blockquote>`;
              if (node.type === "link") {
                const linkChildren = Array.isArray(node.children) ? (node.children as Record<string, unknown>[]) : [];
                return `<a href="${String(node.href ?? "#")}">${String(linkChildren[0]?.text ?? node.text ?? "")}</a>`;
              }
              return String(node.text ?? "");
            })
            .join("");
          return `<p>${inner}</p>`;
        }
        return "";
      }
      if (b.type === "list") {
        const tag = b.style === "numbered" ? "ol" : "ul";
        const items = Array.isArray(b.items)
          ? b.items.map((it: unknown) => `<li>${String(it)}</li>`).join("")
          : "";
        return `<${tag}>${items}</${tag}>`;
      }
      if (b.type === "code") {
        return `<pre><code>${String(b.code ?? "")}</code></pre>`;
      }
      if (b.type === "summary") {
        return `<blockquote><p><strong>Resumo:</strong> ${String(b.text ?? "")}</p></blockquote>`;
      }
      return "";
    })
    .filter(Boolean)
    .join("");
}

export default async function AdminNewPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ technologySlug: string; moduleSlug: string }>;
  searchParams: Promise<{ moduleId?: string; edit?: string }>;
}) {
  const { technologySlug, moduleSlug } = await params;
  const { moduleId: moduleIdParam, edit: editParam } = await searchParams;

  const editId = editParam ? Number(editParam) : null;
  const moduleIdFromQuery = moduleIdParam ? Number(moduleIdParam) : null;

  const post = editId
    ? await prisma.post.findUnique({
        where: { id: editId },
        include: { module: { include: { technology: true } } },
      })
    : null;

  const resolvedModuleId = post?.moduleId ?? moduleIdFromQuery;

  let moduleData = null;
  if (resolvedModuleId) {
    moduleData = await prisma.module.findUnique({
      where: { id: resolvedModuleId },
      include: { technology: true },
    });
  } else if (moduleSlug && technologySlug) {
    const tech = await prisma.technology.findUnique({
      where: { slug: technologySlug },
    });
    if (tech) {
      moduleData = await prisma.module.findFirst({
        where: { slug: moduleSlug, technologyId: tech.id },
        include: { technology: true },
      });
    }
  }

  if (!moduleData) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-muted-foreground">
          Módulo não encontrado ou não informado.
        </p>
        <Button asChild variant="outline">
          <Link href="/admin">Voltar para Tecnologias</Link>
        </Button>
      </div>
    );
  }

  let initialHtml = "";
  if (post?.content) {
    const c = post.content as Record<string, unknown>;
    if (typeof c?.html === "string") {
      initialHtml = c.html;
    } else if (Array.isArray(c?.blocks)) {
      initialHtml = convertLegacyBlocksToHtml(c.blocks);
    } else if (typeof c === "string") {
      initialHtml = c;
    }
  }

  return (
    <div className="py-6">
      <PostForm
        moduleId={moduleData.id}
        technologyId={moduleData.technologyId}
        technologySlug={moduleData.technology.slug}
        technologyName={moduleData.technology.name}
        moduleSlug={moduleData.slug}
        moduleTitle={moduleData.title}
        initialPost={
          post
            ? {
                id: post.id,
                title: post.title,
                slug: post.slug,
                concept: post.concept,
                summary: post.summary,
                image: post.image,
                isPublic: post.isPublic,
                status: post.status,
                scheduledFor: post.scheduledFor ? post.scheduledFor.toISOString() : null,
                content: {
                  html: initialHtml,
                },
              }
            : null
        }
      />
    </div>
  );
}
