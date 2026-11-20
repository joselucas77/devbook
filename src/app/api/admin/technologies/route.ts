import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateTechnologySchema } from "@/lib/validations/technology";
import { revalidateTechnologyCache } from "@/lib/revalidate";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateTechnologySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados inválidos", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Obtém a próxima ordem disponível
    const lastTech = await prisma.technology.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (lastTech?.order ?? -1) + 1;

    const created = await prisma.technology.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        category: data.category,
        image: data.image || null,
        order: nextOrder,
      },
    });

    revalidateTechnologyCache(created.slug);

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar tecnologia:", error);
    return NextResponse.json(
      { message: error?.message ?? "Erro interno ao criar tecnologia" },
      { status: 500 }
    );
  }
}
