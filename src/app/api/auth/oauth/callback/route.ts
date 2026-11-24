import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { signAuthToken, getAuthCookieName } from "@/lib/jwt-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
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
        image: true,
      },
    });

    if (!dbUser) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (session.user.image && dbUser.image !== session.user.image) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { image: session.user.image },
      });
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
      maxAge: 60 * 60 * 24 * 7,
    });

    const redirectTo =
      dbUser.role === "ADMIN" || dbUser.role === "EDITOR" ? "/admin" : "/";

    return NextResponse.redirect(new URL(redirectTo, req.url));
  } catch (error) {
    console.error("Erro no callback OAuth:", error);
    return NextResponse.redirect(new URL("/login?error=oauth", req.url));
  }
}
