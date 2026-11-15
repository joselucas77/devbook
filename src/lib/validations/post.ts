import { z } from "zod";

const RichTextNodeSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
  href: z.string().optional(),
  children: z.any().optional(),
  marks: z.array(z.string()).optional(),
});

const RichTextDocSchema = z.object({
  type: z.literal("doc"),
  children: z.array(RichTextNodeSchema),
});

export const ParagraphBlockSchema = z.object({
  type: z.literal("paragraph"),
  content: RichTextDocSchema,
});

export const HeadingBlockSchema = z.object({
  type: z.literal("heading"),
  level: z.union([z.literal(2), z.literal(3)]),
  text: z.string().min(1),
});

export const ListBlockSchema = z.object({
  type: z.literal("list"),
  style: z.enum(["bullet", "numbered"]),
  items: z.array(z.string().min(1)),
});

export const CodeBlockSchema = z.object({
  type: z.literal("code"),
  language: z.string(),
  filename: z.string().optional(),
  code: z.string().min(1),
  explanation: z.string().optional(),
});

export const SummaryBlockSchema = z.object({
  type: z.literal("summary"),
  text: z.string().min(1),
});

export const CreatePostSchema = z
  .object({
    moduleId: z.number().int().positive("ID do módulo inválido"),
    title: z.string().min(1, "Título obrigatório"),
    slug: z.string().min(1, "Slug obrigatório"),
    concept: z.string().nullable().optional(),
    summary: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    isPublic: z.boolean(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "SCHEDULED"]),
    scheduledFor: z.string().nullable().optional(),
    content: z
      .object({
        html: z.string().nullable().optional(),
        blocks: z.array(z.any()).nullable().optional(),
      })
      .refine(
        (data) => {
          if (typeof data.html === "string") {
            const stripped = data.html.replace(/<[^>]*>/g, "").trim();
            if (
              stripped.length > 0 ||
              data.html.includes("<img") ||
              data.html.includes("<hr") ||
              data.html.includes("<code") ||
              data.html.includes("<pre")
            ) {
              return true;
            }
          }
          if (Array.isArray(data.blocks) && data.blocks.length > 0) {
            return true;
          }
          return false;
        },
        {
          message: "O conteúdo do post não pode ficar vazio.",
          path: ["html"],
        }
      ),
  })
  .refine(
    (data) => {
      if (data.status === "SCHEDULED") {
        if (!data.scheduledFor || !data.scheduledFor.trim()) {
          return false;
        }
        let str = data.scheduledFor.trim();
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) {
          str += ":00-03:00";
        }
        const d = new Date(str);
        return !isNaN(d.getTime());
      }
      return true;
    },
    {
      message: "Selecione a data e o horário para o agendamento.",
      path: ["scheduledFor"],
    }
  );

export type CreatePostValues = z.infer<typeof CreatePostSchema>;
