export type RichTextNode =
  | { type: "text"; text: string }
  | { type: "paragraph"; children: RichTextNode[] }
  | { type: "code"; text: string }
  | { type: "link"; href: string; children: RichTextNode[] };

export interface RichTextDoc {
  type: "doc";
  children: RichTextNode[];
}

export type PostContentBlock =
  | {
      type: "heading";
      level: 2 | 3;
      text: string;
    }
  | {
      type: "paragraph";
      content: RichTextDoc;
    }
  | {
      type: "list";
      style: "bullet" | "numbered";
      items: string[];
    }
  | {
      type: "code";
      language: string;
      filename?: string;
      code: string;
      explanation?: string;
    }
  | {
      type: "summary";
      text: string; // resumo/conclusão do conteúdo
    };

// Conteúdo completo do post
export interface PostContent {
  blocks: PostContentBlock[];
}

// Seu Post atual, adaptado
export interface Post {
  id: number;
  title: string;
  slug: string;
  concept: string;
  summary: string;
  content: PostContent;
  isPublic: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  moduleId: number;
  publishedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export const EMPTY_RICH_TEXT_DOC = {
  type: "doc",
  children: [],
};
