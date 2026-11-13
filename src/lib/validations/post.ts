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

export const CreatePostSchema = z.object({
  moduleId: z.number(),
  title: z.string().min(1, "Título obrigatório"),
  slug: z.string().min(1, "Slug obrigatório"),
  concept: z.string().min(1, "Conceito obrigatório"),
  summary: z.string().min(1, "Resumo obrigatório"),
  image: z.string().optional(),
  isPublic: z.boolean(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  content: z
    .object({
      html: z.string().optional(),
      blocks: z.array(z.any()).optional(),
    })
    .refine(
      (data) => {
        if (typeof data.html === "string") {
          const stripped = data.html.replace(/<[^>]*>/g, "").trim();
          if (
            stripped.length > 0 ||
            data.html.includes("<img") ||
            data.html.includes("<hr") ||
            data.html.includes("<code")
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
});

export type CreatePostValues = z.infer<typeof CreatePostSchema>;
