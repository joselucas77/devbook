import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export type LoginValues = z.infer<typeof LoginSchema>;

export const userContextSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
});

export type UserContextData = z.infer<typeof userContextSchema>;
