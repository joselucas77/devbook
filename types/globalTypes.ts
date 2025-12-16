export type PostStatus = "RASCUNHO" | "PUBLICADO" | "ARQUIVADO";

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Technology {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: number;
  categoryId: number;
  moduleId: number;
  title: string;
  slug: string;
  concept: string;
  content: string;
  summary: string;

  isPublic: boolean;
  status: PostStatus;

  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
}

// Tipo específico para a página de post
export interface PostPageData {
  technology: Technology;
  module: Module;
  post: Post;
}
