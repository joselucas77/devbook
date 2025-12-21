import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreatePostSchema } from "@/zod/schemas/post-schema";
import { slugifySmart } from "@/lib/slugifySmart";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Body inválido: envie JSON" },
      { status: 400 }
    );
  }

  // (opcional) normaliza slug
  if (body && typeof body === "object") {
    const b = body as any;
    if (typeof b.slug === "string") b.slug = slugifySmart(b.slug);
    if (!b.slug && typeof b.title === "string") b.slug = slugifySmart(b.title);
  }

  const parsed = CreatePostSchema.safeParse(body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const first =
      flat.formErrors?.[0] ??
      Object.values(flat.fieldErrors).flat()[0] ??
      "Validation error";

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
    data.status === "PUBLISHED" ? existing.publishedAt ?? new Date() : null;

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

  try {
    const updated = await prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        concept: data.concept,
        summary: data.summary,
        content: data.content as any,
        isPublic: data.isPublic,
        status: data.status,
        moduleId: data.moduleId,
        publishedAt: nextPublishedAt,
      },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    const msg =
      typeof e?.message === "string" ? e.message : "Erro ao atualizar post";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "ID inválido." }, { status: 400 });
  }

  // ✅ garante resposta 404 se não existe
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

  try {
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg =
      typeof e?.message === "string" ? e.message : "Erro ao deletar post";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
