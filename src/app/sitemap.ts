import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://devbook.com.br";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/tecnologias`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  try {
    const technologies = await prisma.technology.findMany({
      where: { isArchived: false },
      select: {
        slug: true,
        updatedAt: true,
        modules: {
          select: {
            slug: true,
            updatedAt: true,
            posts: {
              where: {
                status: "PUBLISHED",
                isPublic: true,
              },
              select: {
                slug: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    const dynamicRoutes: MetadataRoute.Sitemap = [];

    for (const tech of technologies) {
      // Rota de módulos da tecnologia
      dynamicRoutes.push({
        url: `${baseUrl}/tecnologias/${tech.slug}/modulos`,
        lastModified: tech.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });

      for (const mod of tech.modules) {
        for (const post of mod.posts) {
          // Rota do post individual
          dynamicRoutes.push({
            url: `${baseUrl}/tecnologias/${tech.slug}/modulos/${mod.slug}/post/${post.slug}`,
            lastModified: post.updatedAt,
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      }
    }

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error("Erro ao gerar sitemap dinâmico:", error);
    return staticRoutes;
  }
}
