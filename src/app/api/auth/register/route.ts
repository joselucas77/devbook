import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAuthCookieName, signAuthToken } from "@/lib/jwt-auth";
import { z } from "zod";

const RegisterBodySchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["ADMIN", "VIEWER"]).optional().default("VIEWER"),
  secretKey: z.string().optional(),
});

const DEFAULT_ADMIN_SECRET = "devbook-admin-master-2026";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = RegisterBodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados inválidos", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, role, secretKey } = parsed.data;

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Já existe uma conta cadastrada com este e-mail." },
        { status: 409 }
      );
    }

    let finalRole: "ADMIN" | "VIEWER" = "VIEWER";

    // Se estiver tentando criar como ADMIN
    if (role === "ADMIN") {
      const expectedSecret =
        process.env.ADMIN_REGISTER_SECRET || DEFAULT_ADMIN_SECRET;

      if (!secretKey || secretKey.trim() !== expectedSecret.trim()) {
        return NextResponse.json(
          { message: "Chave secreta de autorização de administrador inválida." },
          { status: 403 }
        );
      }
      finalRole = "ADMIN";
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    const newUser = await prisma.user.create({
      data: {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: finalRole,
        emailVerified: false,
      },
    });

    const token = await signAuthToken({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    const res = NextResponse.json({
      ok: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

    res.cookies.set(getAuthCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return res;
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      { message: "Erro interno no servidor ao processar cadastro" },
      { status: 500 }
    );
  }
}
