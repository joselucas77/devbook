import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthCookieName, verifyAuthToken } from "@/lib/jwt-auth";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookieName = getAuthCookieName();
  const token = request.cookies.get(cookieName)?.value;

  if (pathname.startsWith("/login") && token) {
    const user = await verifyAuthToken(token);
    if (user) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Rotas públicas e estáticos
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/tecnologias") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/sw.js" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/manifest.json" ||
    pathname.startsWith("/icons")
  ) {
    return NextResponse.next();
  }

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const user = await verifyAuthToken(token);
  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Proteção da área administrativa
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
