import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CreatePostSchema } from "@/lib/validations/post";
import { slugifySmart } from "@/lib/slugify";
import { getAuthCookieName, verifyAuthToken } from "@/lib/jwt-auth";

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Corpo da requisição inválido: envie um JSON válido." },
        { status: 400 }
      );
    }

    // Normaliza tipos e o slug se vier preenchido ou gera automaticamente a partir do título
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
        : flat.formErrors.join("; ") || "Dados inválidos para criação do post.";

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

    // 1. Verifica se o módulo existe
    const moduleItem = await prisma.module.findUnique({
      where: { id: data.moduleId },
      select: { id: true, title: true },
    });

    if (!moduleItem) {
      return NextResponse.json(
        {
          message: `Módulo ID ${data.moduleId} não encontrado. Verifique se o módulo selecionado ainda existe no sistema.`,
        },
        { status: 404 }
      );
    }

    // 2. Verifica proativamente se já existe um post com o mesmo slug neste módulo
    const existingPostWithSlug = await prisma.post.findUnique({
      where: {
        moduleId_slug: {
          moduleId: data.moduleId,
          slug: data.slug,
        },
      },
      select: { id: true, title: true },
    });

    if (existingPostWithSlug) {
      return NextResponse.json(
        {
          message: `Já existe um post cadastrado com o slug "${data.slug}" neste módulo ("${existingPostWithSlug.title}"). Por favor, escolha outro título ou altere o slug.`,
          code: "DUPLICATE_SLUG",
        },
        { status: 409 }
      );
    }

    // 3. Tenta vincular o autor logado, caso exista usuário com esse ID
    let authorId: string | null = null;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(getAuthCookieName())?.value;
      if (token) {
        const user = await verifyAuthToken(token);
        const userId = user?.sub;
        if (userId) {
          const userExists = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
          });
          if (userExists) {
            authorId = userExists.id;
          }
        }
      }
    } catch {
      // Ignora erro ao resolver autor para não bloquear a criação do post
    }

    let finalContent: any;
    if (typeof data.content.html === "string") {
      finalContent = { html: data.content.html };
    } else if (Array.isArray(data.content.blocks)) {
      finalContent = { blocks: data.content.blocks };
    } else {
      finalContent = { html: "" };
    }

    const created = await prisma.post.create({
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
        authorId,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("Erro detalhado ao criar post:", error);

    // Prisma: Unique constraint failed
    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          message: "Conflito: Já existe um post com este slug neste módulo. Por favor, escolha outro slug.",
          code: "DUPLICATE_SLUG",
        },
        { status: 409 }
      );
    }

    // Prisma: Foreign key constraint failed
    if (error?.code === "P2003") {
      return NextResponse.json(
        {
          message: "Erro de relacionamento: O módulo associado não foi encontrado.",
          code: "FOREIGN_KEY_FAILED",
        },
        { status: 400 }
      );
    }

    // Neon / Postgres connection error
    if (
      error?.code === "ECONNRESET" ||
      error?.code === "ECONNREFUSED" ||
      error?.message?.includes("Connection terminated")
    ) {
      return NextResponse.json(
        {
          message: "A conexão com o banco de dados oscilou. Por favor, tente salvar novamente em alguns segundos.",
          code: "DB_CONNECTION_ERROR",
        },
        { status: 503 }
      );
    }

    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        message: "Erro interno no servidor ao salvar o post.",
        details,
        code: error?.code ?? "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
