import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthCookieName, verifyAuthToken } from "@/lib/jwt-auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;
  if (!token) {
    return NextResponse.json({ isAuthenticated: false, user: null });
  }

  try {
    const payload = await verifyAuthToken(token);
    if (!payload) {
      return NextResponse.json({ isAuthenticated: false, user: null });
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
    });
  } catch {
    return NextResponse.json({ isAuthenticated: false, user: null });
  }
}
