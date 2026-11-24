import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SavedPostItemSchema = z.object({
  postId: z.number().int().positive().optional(),
  slug: z.string().min(1).optional(),
  moduleSlug: z.string().min(1).optional(),
  technologySlug: z.string().min(1).optional(),
});

const SavePostBodySchema = z.union([
  SavedPostItemSchema,
  z.object({
    items: z.array(SavedPostItemSchema).max(100),
  }),
]);

async function resolvePostId(item: z.infer<typeof SavedPostItemSchema>) {
  if (item.postId) {
    const post = await prisma.post.findFirst({
      where: {
        id: item.postId,
        isPublic: true,
        status: "PUBLISHED",
        module: { technology: { isArchived: false } },
      },
      select: { id: true },
    });
    return post?.id ?? null;
  }

  if (item.slug) {
    const post = await prisma.post.findFirst({
      where: {
        slug: item.slug,
        isPublic: true,
        status: "PUBLISHED",
        module: {
          ...(item.moduleSlug ? { slug: item.moduleSlug } : {}),
          technology: {
            isArchived: false,
            ...(item.technologySlug ? { slug: item.technologySlug } : {}),
          },
        },
      },
      select: { id: true },
    });
    return post?.id ?? null;
  }

  return null;
}

async function getUserSavedPosts(userId: string) {
  const rows = await prisma.savedPost.findMany({
    where: {
      userId,
      post: {
        isPublic: true,
        status: "PUBLISHED",
        module: {
          technology: { isArchived: false },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      post: {
        select: {
          id: true,
          slug: true,
          title: true,
          module: {
            select: {
              slug: true,
              title: true,
              technology: {
                select: {
                  slug: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return rows.map((row) => ({
    postId: row.post.id,
    slug: row.post.slug,
    title: row.post.title,
    technologySlug: row.post.module.technology.slug,
    technologyName: row.post.module.technology.name,
    moduleSlug: row.post.module.slug,
    moduleTitle: row.post.module.title,
    addedAt: row.createdAt.toISOString(),
  }));
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const items = await getUserSavedPosts(user.id);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Erro ao buscar posts salvos:", error);
    return NextResponse.json(
      { message: "Erro ao carregar posts salvos." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const json = await req.json().catch(() => null);
    const parsed = SavePostBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados inválidos para salvar post." },
        { status: 400 }
      );
    }

    const candidates = "items" in parsed.data ? parsed.data.items : [parsed.data];
    for (const candidate of candidates) {
      const postId = await resolvePostId(candidate);
      if (!postId) continue;

      await prisma.savedPost.upsert({
        where: {
          userId_postId: {
            userId: user.id,
            postId,
          },
        },
        create: {
          userId: user.id,
          postId,
        },
        update: {},
      });
    }

    const items = await getUserSavedPosts(user.id);
    return NextResponse.json({ saved: true, items });
  } catch (error) {
    console.error("Erro ao salvar post:", error);
    return NextResponse.json(
      { message: "Erro ao salvar post." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const postIdParam = url.searchParams.get("postId");
    const slugParam = url.searchParams.get("slug");
    const moduleSlugParam = url.searchParams.get("moduleSlug");
    const technologySlugParam = url.searchParams.get("technologySlug");

    let candidate: z.infer<typeof SavedPostItemSchema> = {
      postId: postIdParam ? Number(postIdParam) : undefined,
      slug: slugParam ?? undefined,
      moduleSlug: moduleSlugParam ?? undefined,
      technologySlug: technologySlugParam ?? undefined,
    };

    if (!candidate.postId && !candidate.slug) {
      const body = await req.json().catch(() => null);
      const parsed = SavedPostItemSchema.safeParse(body);
      if (parsed.success) {
        candidate = parsed.data;
      }
    }

    const postId = await resolvePostId(candidate);
    if (postId) {
      await prisma.savedPost.deleteMany({
        where: {
          userId: user.id,
          postId,
        },
      });
    } else if (candidate.slug) {
      await prisma.savedPost.deleteMany({
        where: {
          userId: user.id,
          post: {
            slug: candidate.slug,
          },
        },
      });
    }

    const items = await getUserSavedPosts(user.id);
    return NextResponse.json({ saved: false, items });
  } catch (error) {
    console.error("Erro ao remover post salvo:", error);
    return NextResponse.json(
      { message: "Erro ao remover post salvo." },
      { status: 500 }
    );
  }
}
