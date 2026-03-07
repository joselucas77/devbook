import { z } from "zod";

const RichTextNodeSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
  href: z.string().optional(),
  children: z.any().optional(),
});

const RichTextDocSchema = z.object({
  type: z.literal("doc"),
  children: z.array(RichTextNodeSchema),
});

const ParagraphBlockSchema = z.object({
  type: z.literal("paragraph"),
  content: RichTextDocSchema,
});

const HeadingBlockSchema = z.object({
  type: z.literal("heading"),
  level: z.union([z.literal(2), z.literal(3)]),
  text: z.string().min(1),
});

const ListBlockSchema = z.object({
  type: z.literal("list"),
  style: z.enum(["bullet", "numbered"]),
  items: z.array(z.string().min(1)),
});

const CodeBlockSchema = z.object({
  type: z.literal("code"),
  language: z.string(),
  filename: z.string().optional(),
  code: z.string().min(1),
  explanation: z.string().optional(),
});

const SummaryBlockSchema = z.object({
  type: z.literal("summary"),
  text: z.string().min(1),
});

export const CreatePostSchema = z.object({
  moduleId: z.number(),
  title: z.string().min(1),
  slug: z.string().min(1),
  concept: z.string().min(1),
  summary: z.string().min(1),
  isPublic: z.boolean(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  content: z.object({
    blocks: z.array(
      z.discriminatedUnion("type", [
        ParagraphBlockSchema,
        HeadingBlockSchema,
        ListBlockSchema,
        CodeBlockSchema,
        SummaryBlockSchema,
      ]),
    ),
  }),
});
