import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateModuleSchema = z.object({
  technologyId: z.number().int().positive(),
  title: z.string().min(2),
  slug: z.string().min(2),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreateModuleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation error", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const created = await prisma.module.create({
    data: parsed.data,
  });

  return NextResponse.json(created, { status: 201 });
}
