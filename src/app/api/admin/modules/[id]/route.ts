import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateModuleSchema } from "@/lib/validations/module";

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
    const parsed = UpdateModuleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados inválidos", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.module.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Erro ao atualizar módulo:", error);
    return NextResponse.json(
      { message: error?.message ?? "Erro interno ao atualizar módulo" },
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

    await prisma.module.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Erro ao deletar módulo:", error);
    return NextResponse.json(
      { message: error?.message ?? "Erro interno ao deletar módulo" },
      { status: 500 }
    );
  }
}
