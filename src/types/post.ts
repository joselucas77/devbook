export type RichTextTextNode = {
  type: "text";
  text: string;
  marks?: ("bold" | "italic" | "underline")[];
};

export type RichTextCodeNode = { type: "code"; text: string };

export type RichTextQuoteNode = { type: "quote"; text: string };

export type RichTextLinkNode = {
  type: "link";
  href: string;
  children: RichTextNode[];
};

export type RichTextParagraphNode = {
  type: "paragraph";
  children: RichTextNode[];
};

export type RichTextNode =
  | RichTextTextNode
  | RichTextCodeNode
  | RichTextQuoteNode
  | RichTextParagraphNode
  | RichTextLinkNode;

export interface RichTextDoc {
  type: "doc";
  children: RichTextNode[];
}

export const EMPTY_RICH_TEXT_DOC: RichTextDoc = {
  type: "doc",
  children: [],
};

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
      text: string;
    };

export interface PostContent {
  blocks: PostContentBlock[];
}

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
  authorId?: string | null;
  publishedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Technology {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  category: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Module {
  id: number;
  title: string;
  slug: string;
  technologyId: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
