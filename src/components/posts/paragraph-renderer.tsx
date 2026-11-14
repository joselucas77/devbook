import React from "react";
import { RichTextDoc, RichTextNode } from "@/types/post";

interface ParagraphRendererProps {
  content: RichTextDoc;
}

export function ParagraphRenderer({ content }: ParagraphRendererProps) {
  if (!content || !Array.isArray(content.children)) {
    return null;
  }

  return (
    <p className="leading-relaxed my-3">
      {content.children.map((node: RichTextNode, i: number) => {
        if (node.type === "text") {
          let el: React.ReactNode = node.text;

          if (node.marks?.includes("bold")) el = <strong>{el}</strong>;
          if (node.marks?.includes("italic")) el = <em>{el}</em>;
          if (node.marks?.includes("underline")) el = <u>{el}</u>;

          return <span key={i}>{el}</span>;
        }

        if (node.type === "link") {
          return (
            <a
              key={i}
              href={node.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline underline-offset-4 hover:text-blue-400 transition-colors"
            >
              {node.children?.map((c, j) => (
                <span key={j}>{(c as any).text ?? ""}</span>
              ))}
            </a>
          );
        }

        if (node.type === "code") {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 font-mono text-[0.875em] font-medium text-foreground inline"
            >
              {node.text}
            </code>
          );
        }

        if (node.type === "quote") {
          return (
            <blockquote
              key={i}
              className="border-l-2 border-blue-500 pl-4 italic text-muted-foreground my-2"
            >
              {node.text}
            </blockquote>
          );
        }

        return null;
      })}
    </p>
  );
}
