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
  categoryId: number;
  moduleId: number;
  title: string;
  slug: string;
  concept: string;
  content: PostContent; // <-- mudou aqui
  summary: string;
  isPublic: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; // exemplo
  publishedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}
