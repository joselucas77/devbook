import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAuthCookieName, signAuthToken } from "@/lib/auth/jwt";

const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha muito curta"),
});

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = LoginSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation error", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { message: "Credenciais inválidas" },
      { status: 401 }
    );
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return NextResponse.json(
      { message: "Credenciais inválidas" },
      { status: 401 }
    );
  }

  const token = await signAuthToken({
    sub: String(user.id),
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const res = NextResponse.json({ ok: true });

  res.cookies.set(getAuthCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  return res;
}
