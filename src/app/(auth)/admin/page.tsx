import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { publishDueScheduledPosts } from "@/lib/publish-scheduled";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard | Painel DevBook",
};

export default async function AdminPage() {
  await publishDueScheduledPosts();

  const now = new Date();
  const sixMonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalTechnologies,
    activeTechnologies,
    totalModules,
    postStatusCounts,
    publicPostsCount,
    totalFavorites,
    favoritedGroups,
    totalUsers,
    viewerUsers,
    recentPosts,
    techPostStats,
  ] = await Promise.all([
    prisma.technology.count(),
    prisma.technology.count({ where: { isArchived: false } }),
    prisma.module.count(),
    prisma.post.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.post.count({ where: { isPublic: true } }),
    prisma.savedPost.count(),
    prisma.savedPost.groupBy({
      by: ["postId"],
      _count: { _all: true },
      orderBy: { _count: { postId: "desc" } },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "VIEWER" } }),
    prisma.post.findMany({
      where: { createdAt: { gte: sixMonthsStart } },
      select: { createdAt: true, status: true },
    }),
    prisma.technology.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        modules: {
          select: {
            posts: {
              select: {
                status: true,
                _count: { select: { savedBy: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  const statusMap = new Map(
    postStatusCounts.map((item) => [item.status, item._count._all])
  );
  const publishedPosts = statusMap.get("PUBLISHED") ?? 0;
  const draftPosts = statusMap.get("DRAFT") ?? 0;
  const scheduledPosts = statusMap.get("SCHEDULED") ?? 0;
  const archivedPosts = statusMap.get("ARCHIVED") ?? 0;
  const totalPosts =
    publishedPosts + draftPosts + scheduledPosts + archivedPosts;

  const postsByTechnology = techPostStats
    .map((tech) => {
      let published = 0;
      let others = 0;
      let favorites = 0;

      for (const mod of tech.modules) {
        for (const post of mod.posts) {
          if (post.status === "PUBLISHED") {
            published += 1;
          } else {
            others += 1;
          }
          favorites += post._count.savedBy;
        }
      }

      return {
        id: tech.id,
        name: tech.name,
        slug: tech.slug,
        published,
        others,
        total: published + others,
        favorites,
      };
    })
    .filter((t) => t.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const monthBuckets = Array.from({ length: 6 }, (_, idx) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d
      .toLocaleDateString("pt-BR", { month: "short" })
      .replace(".", "");
    return { key, label, count: 0, publishedCount: 0 };
  });

  const bucketByKey = new Map(monthBuckets.map((b) => [b.key, b]));
  for (const post of recentPosts) {
    const d = post.createdAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = bucketByKey.get(key);
    if (bucket) {
      bucket.count += 1;
      if (post.status === "PUBLISHED") {
        bucket.publishedCount += 1;
      }
    }
  }

  const topGroups = favoritedGroups.slice(0, 5);
  const topPostIds = topGroups.map((g) => g.postId);
  const topPostsRaw =
    topPostIds.length > 0
      ? await prisma.post.findMany({
          where: { id: { in: topPostIds } },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            moduleId: true,
            module: {
              select: {
                title: true,
                slug: true,
                technology: {
                  select: { name: true, slug: true },
                },
              },
            },
          },
        })
      : [];

  const postById = new Map(topPostsRaw.map((p) => [p.id, p]));
  const topFavoritedPosts = topGroups
    .map((group) => {
      const post = postById.get(group.postId);
      if (!post) return null;
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        moduleId: post.moduleId,
        moduleTitle: post.module.title,
        moduleSlug: post.module.slug,
        technologyName: post.module.technology.name,
        technologySlug: post.module.technology.slug,
        favoritesCount: group._count._all,
        status: post.status,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral das métricas do sistema, publicações e favoritos.
          </p>
        </div>

        <Button asChild className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-600/90 text-white shrink-0">
          <Link href="/admin/tecnologias">
            <i className="bx bx-code-alt text-base" />
            Gerenciar Tecnologias
          </Link>
        </Button>
      </div>

      <AdminDashboard
        data={{
          metrics: {
            totalPosts,
            publishedPosts,
            draftPosts,
            scheduledPosts,
            archivedPosts,
            publicPosts: publicPostsCount,
            totalFavorites,
            uniqueFavoritedPosts: favoritedGroups.length,
            totalTechnologies,
            activeTechnologies,
            totalModules,
            totalUsers,
            viewerUsers,
          },
          postsByTechnology,
          monthlyActivity: monthBuckets,
          topFavoritedPosts,
        }}
      />
    </div>
  );
}
