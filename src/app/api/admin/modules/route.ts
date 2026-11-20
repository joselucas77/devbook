import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateModuleSchema } from "@/lib/validations/module";
import { revalidateModuleCache } from "@/lib/revalidate";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateModuleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados inválidos", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Obtém a próxima ordem disponível para este módulo dentro da tecnologia
    const lastModule = await prisma.module.findFirst({
      where: { technologyId: parsed.data.technologyId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (lastModule?.order ?? -1) + 1;

    const created = await prisma.module.create({
      data: {
        ...parsed.data,
        order: nextOrder,
      },
      include: {
        technology: { select: { slug: true } },
      },
    });

    revalidateModuleCache(created.technology?.slug);

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar módulo:", error);
    return NextResponse.json(
      { message: error?.message ?? "Erro interno ao criar módulo" },
      { status: 500 }
    );
  }
}
