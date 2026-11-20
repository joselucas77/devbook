import { highlightCode } from "@/lib/shiki";

export type PostSegment =
  | { type: "html"; html: string }
  | {
      type: "code";
      code: string;
      language?: string;
      filename?: string;
      highlightedHtml?: string;
    };

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function wrapTablesWithScroll(html: string): string {
  if (!html || !html.includes("<table")) return html;

  const unnested = html.replace(
    /<div class="table-wrapper">([\s\S]*?<\/table>)<\/div>/gi,
    "$1"
  );
  return unnested.replace(
    /(<table[\s\S]*?<\/table>)/gi,
    '<div class="table-wrapper">$1</div>'
  );
}

/**
 * Faz o parsing do HTML do post e executa o realce de sintaxe Shiki no servidor.
 */
export async function parsePostHtmlServer(html: string): Promise<PostSegment[]> {
  if (!html) return [];

  const segments: PostSegment[] = [];
  const preRegex = /<pre(?:\s+[^>]*)?>([\s\S]*?)<\/pre>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = preRegex.exec(html)) !== null) {
    const textBefore = html.slice(lastIndex, match.index);
    if (textBefore.trim().length > 0) {
      segments.push({ type: "html", html: wrapTablesWithScroll(textBefore) });
    }

    const inner = match[1];
    const codeMatch =
      /<code(?:\s+class="([^"]*)")?[^>]*>([\s\S]*?)<\/code>/i.exec(inner);

    let rawCode = "";
    let language: string | undefined;

    if (codeMatch) {
      const cls = codeMatch[1] || "";
      const langMatch = /language-([a-zA-Z0-9_-]+)/.exec(cls);
      if (langMatch) language = langMatch[1];
      rawCode = decodeHtmlEntities(codeMatch[2]);
    } else {
      rawCode = decodeHtmlEntities(inner);
    }

    const highlightedHtml = await highlightCode(rawCode, language);

    segments.push({
      type: "code",
      code: rawCode,
      language,
      highlightedHtml,
    });

    lastIndex = preRegex.lastIndex;
  }

  const remaining = html.slice(lastIndex);
  if (remaining.trim().length > 0) {
    segments.push({ type: "html", html: wrapTablesWithScroll(remaining) });
  }

  return segments;
}
