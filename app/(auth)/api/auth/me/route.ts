import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthCookieName, verifyAuthToken } from "@/lib/auth/jwt";

export async function GET() {
  const token = (await cookies()).get(getAuthCookieName())?.value;
  if (!token) return NextResponse.json({ isAuthenticated: false, user: null });

  try {
    const payload = await verifyAuthToken(token);
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
