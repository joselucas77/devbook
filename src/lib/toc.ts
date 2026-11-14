import { slugifySmart } from "@/lib/slugify";

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export function extractHeadingsAndInjectIds(html: string): {
  headings: HeadingItem[];
  modifiedHtml: string;
} {
  if (!html) return { headings: [], modifiedHtml: "" };

  const headings: HeadingItem[] = [];
  const slugCounts = new Map<string, number>();

  // Captura tags <h2> e <h3>
  const regex = /<h([23])(?:\s+([^>]*))?>([\s\S]*?)<\/h\1>/gi;

  const modifiedHtml = html.replace(
    regex,
    (fullMatch, levelStr, attrsStr, innerHtml) => {
      const level = parseInt(levelStr, 10);
      const text = innerHtml.replace(/<[^>]*>/g, "").trim();

      if (!text) return fullMatch;

      const baseSlug = slugifySmart(text) || `topico-${headings.length + 1}`;
      const count = slugCounts.get(baseSlug) || 0;
      slugCounts.set(baseSlug, count + 1);

      const uniqueId = count === 0 ? baseSlug : `${baseSlug}-${count}`;

      headings.push({
        id: uniqueId,
        text,
        level,
      });

      const existingAttrs = attrsStr || "";
      const cleanAttrs = existingAttrs
        .replace(/\s*id=(["'][^"']*["']|[^\s>]+)/gi, "")
        .trim();

      return `<h${level} id="${uniqueId}" class="scroll-mt-24 ${cleanAttrs}">${innerHtml}</h${level}>`;
    }
  );

  return { headings, modifiedHtml };
}
