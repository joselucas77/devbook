import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreatePostSchema } from "@/zod/schemas/post-schema";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreatePostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation error", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const created = await prisma.post.create({
    data: {
      title: data.title,
      slug: data.slug,
      concept: data.concept,
      summary: data.summary,
      content: data.content as any,
      isPublic: data.isPublic,
      status: data.status,
      moduleId: data.moduleId,
      // authorId: (se você tiver sessão, coloca aqui)
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
