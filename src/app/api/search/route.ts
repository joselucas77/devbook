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

    const pattern = `%${q}%`;

    try {
      // Busca insensível a acentuação e maiúsculas/minúsculas usando unaccent do PostgreSQL
      const [technologies, modules, posts] = await Promise.all([
        prisma.$queryRaw<any[]>`
          SELECT id, name, slug, category, image, description
          FROM "Technology"
          WHERE unaccent("name") ILIKE unaccent(${pattern})
             OR unaccent("description") ILIKE unaccent(${pattern})
             OR unaccent("category") ILIKE unaccent(${pattern})
             OR "slug" ILIKE ${pattern}
          LIMIT 5
        `,

        prisma.$queryRaw<any[]>`
          SELECT 
            m.id, m.title, m.slug,
            json_build_object('name', t.name, 'slug', t.slug) as technology
          FROM "Module" m
          JOIN "Technology" t ON t.id = m."technologyId"
          WHERE unaccent(m.title) ILIKE unaccent(${pattern})
             OR m.slug ILIKE ${pattern}
             OR unaccent(t.name) ILIKE unaccent(${pattern})
          LIMIT 5
        `,

        prisma.$queryRaw<any[]>`
          SELECT 
            p.id, p.title, p.slug, p.summary,
            json_build_object(
              'title', m.title,
              'slug', m.slug,
              'technology', json_build_object('name', t.name, 'slug', t.slug)
            ) as module
          FROM "Post" p
          JOIN "Module" m ON m.id = p."moduleId"
          JOIN "Technology" t ON t.id = m."technologyId"
          WHERE p.status = 'PUBLISHED' AND p."isPublic" = true
            AND (
              unaccent(p.title) ILIKE unaccent(${pattern})
              OR unaccent(COALESCE(p.summary, '')) ILIKE unaccent(${pattern})
              OR unaccent(COALESCE(p.concept, '')) ILIKE unaccent(${pattern})
              OR p.slug ILIKE ${pattern}
            )
          LIMIT 8
        `,
      ]);

      return NextResponse.json({
        technologies,
        modules,
        posts,
      });
    } catch (dbError) {
      console.warn("Aviso na busca com unaccent, executando fallback padrão:", dbError);

      // Fallback padrão com Prisma ILIKE caso ocorra qualquer imprevisto
      const [technologies, modules, posts] = await Promise.all([
        prisma.technology.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { category: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
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
              { slug: { contains: q, mode: "insensitive" } },
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
    }
  } catch (error) {
    console.error("Erro na busca global:", error);
    return NextResponse.json(
      { message: "Erro ao realizar busca" },
      { status: 500 }
    );
  }
}
