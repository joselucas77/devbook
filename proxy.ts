import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getAuthCookieName } from "./lib/auth/jwt";

const secret = new TextEncoder().encode(process.env.AUTH_JWT_SECRET);

async function getUserFromToken(token: string) {
  const { payload } = await jwtVerify(token, secret);

  return payload as {
    sub: string;
    email: string;
    name: string;
    role: "ADMIN" | "EDITOR" | "VIEWER";
  };
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/tecnologias") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(getAuthCookieName())?.value;

  // ❌ Não logado
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const user = await getUserFromToken(token);

    // 🔐 Área admin
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (user.role !== "ADMIN" && user.role !== "EDITOR") {
        return NextResponse.redirect(new URL("/tecnologias", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
