import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { signAuthToken, getAuthCookieName } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  // 1️⃣ pega sessão do Better Auth
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (!dbUser) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const token = await signAuthToken({
    sub: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
  });

  const cookieStore = await cookies();
  cookieStore.set({
    name: getAuthCookieName(),
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  const redirectTo =
    dbUser.role === "ADMIN" || dbUser.role === "EDITOR" ? "/admin" : "/";

  return NextResponse.redirect(new URL(redirectTo, req.url));
}
