import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "devbook_token";
const secret = new TextEncoder().encode(
  process.env.AUTH_JWT_SECRET ?? "dev-secret"
);

export function getAuthCookieName() {
  return COOKIE_NAME;
}

export type AuthJwtPayload = {
  sub: string; // user id
  email: string;
  role: "ADMIN" | "EDITOR";
  name: string;
};

export async function signAuthToken(payload: AuthJwtPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as AuthJwtPayload;
}
