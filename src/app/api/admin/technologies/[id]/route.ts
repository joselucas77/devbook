import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateTechnologySchema } from "@/lib/validations/technology";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: "ID inválido." }, { status: 400 });
    }

    const body = await req.json();
    const parsed = UpdateTechnologySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados inválidos", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const updated = await prisma.technology.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.slug ? { slug: data.slug } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(data.category ? { category: data.category } : {}),
        ...(data.image !== undefined ? { image: data.image || null } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Erro ao atualizar tecnologia:", error);
    return NextResponse.json(
      { message: error?.message ?? "Erro interno ao atualizar tecnologia" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: "ID inválido." }, { status: 400 });
    }

    await prisma.technology.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Erro ao deletar tecnologia:", error);
    return NextResponse.json(
      { message: error?.message ?? "Erro interno ao deletar tecnologia" },
      { status: 500 }
    );
  }
}
