import { z } from "zod";

export const CreateModuleSchema = z.object({
  technologyId: z.number().int().positive(),
  title: z.string().min(2, "Título obrigatório"),
  slug: z
    .string()
    .min(2, "Slug obrigatório")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido"),
});

export type CreateModuleValues = z.infer<typeof CreateModuleSchema>;

export const UpdateModuleSchema = z.object({
  title: z.string().min(2, "Título deve ter no mínimo 2 caracteres").optional(),
  slug: z
    .string()
    .min(2, "Slug deve ter no mínimo 2 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido")
    .optional(),
});

export type UpdateModuleValues = z.infer<typeof UpdateModuleSchema>;
