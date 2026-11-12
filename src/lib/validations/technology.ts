import { z } from "zod";

export const CreateTechnologySchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  slug: z.string().min(2, "Slug obrigatório"),
  description: z.string().min(5, "Descrição obrigatória"),
  category: z.string().min(2, "Categoria obrigatória"),
  image: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type CreateTechnologyValues = z.infer<typeof CreateTechnologySchema>;

export const UpdateTechnologySchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  category: z.string().min(2).optional(),
  image: z.string().url().optional().or(z.literal("")).optional(),
});

export type UpdateTechnologyValues = z.infer<typeof UpdateTechnologySchema>;
