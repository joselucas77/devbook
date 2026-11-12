import { JSDOM } from "jsdom";
import { RichTextDoc, RichTextNode } from "@/types/post";

export function htmlToParagraphJson(html: string): RichTextDoc {
  const dom = new JSDOM(`<body>${html}</body>`);
  const body = dom.window.document.body;

  const parseNode = (node: ChildNode): RichTextNode | RichTextNode[] | null => {
    if (node.nodeType === 3) {
      return { type: "text", text: node.textContent ?? "" };
    }

    if (!(node instanceof dom.window.HTMLElement)) return null;

    const children = Array.from(node.childNodes)
      .map(parseNode)
      .flat()
      .filter((n): n is RichTextNode => n !== null);

    switch (node.tagName) {
      case "B":
      case "STRONG":
        return children.map((c) => ({
          ...c,
          marks: [...((c as any).marks ?? []), "bold"],
        }));

      case "I":
      case "EM":
        return children.map((c) => ({
          ...c,
          marks: [...((c as any).marks ?? []), "italic"],
        }));

      case "U":
        return children.map((c) => ({
          ...c,
          marks: [...((c as any).marks ?? []), "underline"],
        }));

      case "A":
        return {
          type: "link",
          href: node.getAttribute("href") ?? "#",
          children,
        };

      case "CODE":
        return { type: "code", text: node.textContent ?? "" };

      case "BLOCKQUOTE":
        return { type: "quote", text: node.textContent ?? "" };

      default:
        return children;
    }
  };

  const children = Array.from(body.childNodes)
    .map(parseNode)
    .flat()
    .filter((n): n is RichTextNode => n !== null);

  return {
    type: "doc",
    children,
  };
}
