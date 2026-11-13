import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthCookieName, verifyAuthToken } from "@/lib/jwt-auth";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Arquivos estáticos e assets públicos (imagens, ícones, manifest, sw, etc.)
  if (
    pathname.includes(".") ||
    pathname.startsWith("/icons") ||
    pathname === "/sw.js" ||
    pathname === "/site.webmanifest" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/manifest.json"
  ) {
    return NextResponse.next();
  }

  const cookieName = getAuthCookieName();
  const token = request.cookies.get(cookieName)?.value;

  // Redirecionamento se já logado ao acessar páginas de login/cadastro públicas
  if ((pathname === "/login" || pathname === "/cadastro") && token) {
    const user = await verifyAuthToken(token);
    if (user) {
      if (user.role === "ADMIN" || user.role === "EDITOR") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(new URL("/tecnologias", request.url));
    }
  }

  // Se já logado como ADMIN ao acessar login de admin ou cadastro secreto de admin
  if (
    (pathname === "/admin/login" || pathname === "/admin/cadastro-secreto") &&
    token
  ) {
    const user = await verifyAuthToken(token);
    if (user && (user.role === "ADMIN" || user.role === "EDITOR")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Rotas públicas que não requerem autenticação
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/cadastro" ||
    pathname === "/admin/login" ||
    pathname === "/admin/cadastro-secreto" ||
    pathname.startsWith("/tecnologias") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/search")
  ) {
    return NextResponse.next();
  }

  // Verificação de autenticação para rotas protegidas
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const user = await verifyAuthToken(token);
  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Proteção da área administrativa (/admin e /api/admin)
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (user.role !== "ADMIN" && user.role !== "EDITOR") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ message: "Acesso proibido" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/tecnologias", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|json)$).*)",
  ],
};
