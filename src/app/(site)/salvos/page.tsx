import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SavedPostsList } from "@/components/posts/saved-posts-list";
import type { FavoritePost } from "@/hooks/use-reading-progress";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Posts Salvos",
  description: "Acesse rapidamente os artigos que você salvou no DevBook.",
};

export default async function SalvosPage() {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }

  let initialItems: FavoritePost[] = [];

  if (user) {
    try {
      const rows = await prisma.savedPost.findMany({
        where: {
          userId: user.id,
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

      initialItems = rows.map((row) => ({
        postId: row.post.id,
        slug: row.post.slug,
        title: row.post.title,
        technologySlug: row.post.module.technology.slug,
        technologyName: row.post.module.technology.name,
        moduleSlug: row.post.module.slug,
        moduleTitle: row.post.module.title,
        addedAt: row.createdAt.toISOString(),
      }));
    } catch (error) {
      console.error("Erro ao carregar posts salvos no servidor:", error);
    }
  }

  return (
    <SavedPostsList
      isAuthenticated={Boolean(user)}
      initialItems={initialItems}
    />
  );
}
