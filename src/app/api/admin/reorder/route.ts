import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { type, orderedIds } = body;

    if (!type || !Array.isArray(orderedIds)) {
      return NextResponse.json(
        { message: "Parâmetros inválidos: type e orderedIds são obrigatórios." },
        { status: 400 }
      );
    }

    if (type === "technologies") {
      await prisma.$transaction(
        orderedIds.map((id: number, index: number) =>
          prisma.technology.update({
            where: { id: Number(id) },
            data: { order: index },
          })
        )
      );
    } else if (type === "modules") {
      await prisma.$transaction(
        orderedIds.map((id: number, index: number) =>
          prisma.module.update({
            where: { id: Number(id) },
            data: { order: index },
          })
        )
      );
    } else if (type === "posts") {
      await prisma.$transaction(
        orderedIds.map((id: number, index: number) =>
          prisma.post.update({
            where: { id: Number(id) },
            data: { order: index },
          })
        )
      );
    } else {
      return NextResponse.json(
        { message: "Tipo de entidade desconhecido." },
        { status: 400 }
      );
    }

    try {
      revalidatePath("/tecnologias");
      revalidatePath("/(site)", "layout");
    } catch (e) {
      console.warn("Aviso ao revalidar cache após reordenação:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Ordem atualizada com sucesso.",
    });
  } catch (error: any) {
    console.error("Erro ao reordenar:", error);
    return NextResponse.json(
      { message: error?.message || "Erro interno ao reordenar." },
      { status: 500 }
    );
  }
}
