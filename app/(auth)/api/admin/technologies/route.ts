import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateTechnologySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(5),
  category: z.string().min(2),
  image: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreateTechnologySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation error", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const created = await prisma.technology.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      category: data.category,
      image: data.image || null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
