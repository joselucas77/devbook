import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAuthCookieName, signAuthToken } from "@/lib/jwt-auth";
import { LoginSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = LoginSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados inválidos", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
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

    const res = NextResponse.json({ ok: true, user: { name: user.name, role: user.role } });

    res.cookies.set(getAuthCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return res;
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { message: "Erro interno no servidor ao processar login" },
      { status: 500 }
    );
  }
}
