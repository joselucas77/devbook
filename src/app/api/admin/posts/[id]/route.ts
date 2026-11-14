import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreatePostSchema } from "@/lib/validations/post";
import { slugifySmart } from "@/lib/slugify";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: "ID do post inválido." }, { status: 400 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Body inválido: envie JSON válido." },
        { status: 400 }
      );
    }

    if (body && typeof body === "object") {
      if (body.moduleId !== undefined && body.moduleId !== null) {
        body.moduleId = Number(body.moduleId);
      }
      if (body.isPublic !== undefined && body.isPublic !== null) {
        body.isPublic = Boolean(body.isPublic);
      }
      if (typeof body.slug === "string" && body.slug.trim()) {
        body.slug = slugifySmart(body.slug);
      } else if (typeof body.title === "string" && body.title.trim()) {
        body.slug = slugifySmart(body.title);
      }
    }

    const parsed = CreatePostSchema.safeParse(body);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const fieldDetails = Object.entries(flat.fieldErrors)
        .map(([field, errs]) => `${field}: ${errs?.join(", ")}`)
        .join("; ");
      const msg = fieldDetails
        ? `Campos inválidos: ${fieldDetails}`
        : flat.formErrors.join("; ") || "Dados inválidos para atualização do post.";

      return NextResponse.json(
        {
          message: msg,
          fieldErrors: flat.fieldErrors,
          formErrors: flat.formErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.post.findUnique({
      where: { id },
      select: { id: true, publishedAt: true, slug: true, moduleId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { message: `Post com ID ${id} não encontrado.` },
        { status: 404 }
      );
    }

    const moduleExists = await prisma.module.findUnique({
      where: { id: data.moduleId },
      select: { id: true, title: true },
    });

    if (!moduleExists) {
      return NextResponse.json(
        { message: `Módulo ID ${data.moduleId} não encontrado.` },
        { status: 404 }
      );
    }

    // Verifica se já existe outro post com o mesmo slug neste módulo (caso slug ou módulo tenha mudado)
    if (data.slug !== existing.slug || data.moduleId !== existing.moduleId) {
      const duplicateSlug = await prisma.post.findFirst({
        where: {
          moduleId: data.moduleId,
          slug: data.slug,
          id: { not: id },
        },
        select: { id: true, title: true },
      });

      if (duplicateSlug) {
        return NextResponse.json(
          {
            message: `Já existe outro post com o slug "${data.slug}" neste módulo ("${duplicateSlug.title}").`,
            code: "DUPLICATE_SLUG",
          },
          { status: 409 }
        );
      }
    }

    const nextPublishedAt =
      data.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : null;

    let finalContent: any;
    if (typeof data.content.html === "string") {
      finalContent = { html: data.content.html };
    } else if (Array.isArray(data.content.blocks)) {
      finalContent = { blocks: data.content.blocks };
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

    if (e?.code === "P2002") {
      return NextResponse.json(
        {
          message: "Conflito: Já existe um post com este slug neste módulo.",
          code: "DUPLICATE_SLUG",
        },
        { status: 409 }
      );
    }

    if (e?.code === "P2003") {
      return NextResponse.json(
        {
          message: "Erro de relacionamento: O módulo associado não foi encontrado.",
          code: "FOREIGN_KEY_FAILED",
        },
        { status: 400 }
      );
    }

    if (
      e?.code === "ECONNRESET" ||
      e?.code === "ECONNREFUSED" ||
      e?.message?.includes("Connection terminated")
    ) {
      return NextResponse.json(
        {
          message: "A conexão com o banco de dados oscilou. Por favor, tente novamente em alguns segundos.",
          code: "DB_CONNECTION_ERROR",
        },
        { status: 503 }
      );
    }

    const details = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        message: "Erro interno no servidor ao atualizar o post.",
        details,
        code: e?.code ?? "INTERNAL_SERVER_ERROR",
      },
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
      return NextResponse.json({ message: "ID do post inválido." }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!post) {
      return NextResponse.json(
        { message: "Post não encontrado para exclusão." },
        { status: 404 }
      );
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ message: "Post deletado com sucesso", id });
  } catch (e: any) {
    console.error("Erro ao deletar post:", e);
    return NextResponse.json(
      { message: e?.message ?? "Erro interno ao deletar post" },
      { status: 500 }
    );
  }
}
