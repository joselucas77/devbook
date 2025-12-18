export type PostContentBlock =
  | {
      type: "heading";
      level: 2 | 3;
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      style: "bullet" | "numbered";
      items: string[];
    }
  | {
      type: "code";
      language: string; // "php", "js", etc.
      filename?: string; // opcional: "index.php"
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
