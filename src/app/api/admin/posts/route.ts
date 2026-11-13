import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreatePostSchema } from "@/lib/validations/post";
import { sanitizeParagraphHtml } from "@/lib/sanitize-html";
import { htmlToParagraphJson } from "@/lib/html-parser";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreatePostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados inválidos", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

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

    const created = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        concept: data.concept,
        summary: data.summary,
        image: data.image || null,
        content: finalContent,
        isPublic: data.isPublic,
        status: data.status,
        moduleId: data.moduleId,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar post:", error);
    return NextResponse.json(
      { message: error?.message ?? "Erro interno ao criar post" },
      { status: 500 }
    );
  }
}
