import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q || q.length < 2) {
      return NextResponse.json({
        technologies: [],
        modules: [],
        posts: [],
      });
    }

    const [technologies, modules, posts] = await Promise.all([
      prisma.technology.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          image: true,
          description: true,
        },
      }),

      prisma.module.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          technology: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),

      prisma.post.findMany({
        where: {
          status: "PUBLISHED",
          isPublic: true,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { concept: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 8,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          module: {
            select: {
              title: true,
              slug: true,
              technology: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      technologies,
      modules,
      posts,
    });
  } catch (error) {
    console.error("Erro na busca global:", error);
    return NextResponse.json(
      { message: "Erro ao realizar busca" },
      { status: 500 }
    );
  }
}
