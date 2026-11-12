export type AuthJwtPayload = {
  sub: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
};
