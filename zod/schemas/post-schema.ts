import z from "zod";

const HeadingBlockSchema = z.object({
  type: z.literal("heading"),
  level: z.union([z.literal(2), z.literal(3)]),
  text: z.string().min(1, "O título da seção é obrigatório."),
});

const ParagraphBlockSchema = z.object({
  type: z.literal("paragraph"),
  text: z.string().min(1, "O parágrafo não pode ficar vazio."),
});

const ListBlockSchema = z.object({
  type: z.literal("list"),
  style: z.union([z.literal("bullet"), z.literal("numbered")]),
  items: z
    .array(z.string().min(1, "Item da lista não pode ficar vazio."))
    .min(1, "Adicione pelo menos 1 item na lista."),
});

const CodeBlockSchema = z.object({
  type: z.literal("code"),
  language: z
    .string()
    .min(1, "Selecione a linguagem.")
    .max(20, "Linguagem muito longa."),
  filename: z.string().optional(),
  code: z.string().min(1, "O código não pode ficar vazio."),
  explanation: z.string().optional(),
});

const SummaryBlockSchema = z.object({
  type: z.literal("summary"),
  text: z.string().min(1, "O resumo final não pode ficar vazio."),
});

const PostContentSchema = z.object({
  blocks: z
    .array(
      z.discriminatedUnion("type", [
        HeadingBlockSchema,
        ParagraphBlockSchema,
        ListBlockSchema,
        CodeBlockSchema,
        SummaryBlockSchema,
      ])
    )
    .min(1, "Adicione pelo menos 1 bloco de conteúdo."),
});

export const CreatePostSchema = z.object({
  moduleId: z.number().int().positive("moduleId inválido."),
  title: z.string().min(3),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  concept: z.string().min(10),
  summary: z.string().min(10),

  // 🔥 deixa obrigatório no tipo do TS
  isPublic: z.boolean(),

  status: z.union([
    z.literal("DRAFT"),
    z.literal("PUBLISHED"),
    z.literal("ARCHIVED"),
  ]),

  content: PostContentSchema,
});
