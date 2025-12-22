import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateTechnologySchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  category: z.string().min(2).optional(),
  image: z.string().url().optional().or(z.literal("")).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  const body = await req.json();
  const parsed = UpdateTechnologySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation error", issues: parsed.error.flatten() },
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
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  await prisma.technology.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
