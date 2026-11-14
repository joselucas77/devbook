"use client";

import { useMemo } from "react";
import { CodeBlock } from "@/components/posts/code-block";

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

type Segment =
  | { type: "html"; html: string }
  | { type: "code"; code: string; language?: string };

export function parsePostHtml(html: string): Segment[] {
  if (!html) return [];

  const segments: Segment[] = [];
  const preRegex = /<pre(?:\s+[^>]*)?>([\s\S]*?)<\/pre>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = preRegex.exec(html)) !== null) {
    const textBefore = html.slice(lastIndex, match.index);
    if (textBefore.trim().length > 0) {
      segments.push({ type: "html", html: textBefore });
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

    segments.push({
      type: "code",
      code: rawCode,
      language,
    });

    lastIndex = preRegex.lastIndex;
  }

  const remaining = html.slice(lastIndex);
  if (remaining.trim().length > 0) {
    segments.push({ type: "html", html: remaining });
  }

  return segments;
}

export function PostContent({ html }: { html: string }) {
  const segments = useMemo(() => parsePostHtml(html), [html]);

  if (!segments.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      {segments.map((seg, idx) => {
        if (seg.type === "html") {
          return (
            <div
              key={idx}
              className="tiptap-content leading-relaxed"
              dangerouslySetInnerHTML={{ __html: seg.html }}
            />
          );
        }

        return (
          <CodeBlock
            key={idx}
            code={seg.code}
            language={seg.language}
          />
        );
      })}
    </div>
  );
}
