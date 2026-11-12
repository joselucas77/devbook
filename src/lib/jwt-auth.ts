import { SignJWT, jwtVerify } from "jose";
import { AuthJwtPayload } from "@/types/auth";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "devbook_token";
const getSecret = () =>
  new TextEncoder().encode(
    process.env.AUTH_JWT_SECRET ?? "devbook-fallback-secret-min-32-chars-long"
  );

export function getAuthCookieName(): string {
  return COOKIE_NAME;
}

export async function signAuthToken(payload: AuthJwtPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyAuthToken(
  token: string
): Promise<AuthJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as AuthJwtPayload;
  } catch {
    return null;
  }
}
