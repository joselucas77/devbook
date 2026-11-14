import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreatePostSchema } from "@/lib/validations/post";
import { slugifySmart } from "@/lib/slugify";
import { sanitizeParagraphHtml } from "@/lib/sanitize-html";
import { htmlToParagraphJson } from "@/lib/html-parser";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: "ID inválido." }, { status: 400 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Body inválido: envie JSON válido" },
        { status: 400 }
      );
    }

    if (body && typeof body === "object") {
      if (typeof body.slug === "string") body.slug = slugifySmart(body.slug);
      if (!body.slug && typeof body.title === "string")
        body.slug = slugifySmart(body.title);
    }

    const parsed = CreatePostSchema.safeParse(body);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const first =
        flat.formErrors?.[0] ??
        Object.values(flat.fieldErrors).flat()[0] ??
        "Erro de validação";

      return NextResponse.json({ message: first, issues: flat }, { status: 400 });
    }

    const data = parsed.data;

    const existing = await prisma.post.findUnique({
      where: { id },
      select: { id: true, publishedAt: true },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Post não encontrado." },
        { status: 404 }
      );
    }

    const nextPublishedAt =
      data.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : null;

    const moduleExists = await prisma.module.findUnique({
      where: { id: data.moduleId },
      select: { id: true },
    });

    if (!moduleExists) {
      return NextResponse.json(
        { message: "Módulo não encontrado." },
        { status: 404 }
      );
    }

    let finalContent: any;
    if (typeof data.content.html === "string") {
      finalContent = { html: data.content.html };
    } else if (Array.isArray(data.content.blocks)) {
      const content = data.content.blocks.map((block: any) => {
        if (block.type === "paragraph") {
          if (typeof block.text === "string") {
            const safeHtml = sanitizeParagraphHtml(block.text);
            return {
              type: "paragraph",
              content: htmlToParagraphJson(safeHtml),
            };
          }
          return block;
        }
        return block;
      });
      finalContent = { blocks: content };
    } else {
      finalContent = { html: "" };
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        concept: data.concept ?? "",
        summary: data.summary ?? "",
        image: data.image || null,
        content: finalContent,
        isPublic: data.isPublic,
        status: data.status,
        moduleId: data.moduleId,
        publishedAt: nextPublishedAt,
      },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("Erro ao atualizar post:", e);
    return NextResponse.json(
      { message: e?.message ?? "Erro interno ao atualizar post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: "ID inválido." }, { status: 400 });
    }

    const existing = await prisma.post.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Post não encontrado." },
        { status: 404 }
      );
    }

    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Erro ao deletar post:", e);
    return NextResponse.json(
      { message: e?.message ?? "Erro interno ao deletar post" },
      { status: 500 }
    );
  }
}
