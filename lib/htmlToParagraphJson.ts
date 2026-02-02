import { JSDOM } from "jsdom";

export function htmlToParagraphJson(html: string) {
  const dom = new JSDOM(`<body>${html}</body>`);
  const body = dom.window.document.body;

  const parseNode = (node: ChildNode): any => {
    if (node.nodeType === 3) {
      return { type: "text", text: node.textContent ?? "" };
    }

    if (!(node instanceof dom.window.HTMLElement)) return null;

    const children = Array.from(node.childNodes).map(parseNode).filter(Boolean);

    switch (node.tagName) {
      case "B":
      case "STRONG":
        return children.map((c) => ({
          ...c,
          marks: [...(c.marks ?? []), "bold"],
        }));

      case "I":
      case "EM":
        return children.map((c) => ({
          ...c,
          marks: [...(c.marks ?? []), "italic"],
        }));

      case "U":
        return children.map((c) => ({
          ...c,
          marks: [...(c.marks ?? []), "underline"],
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
    .filter(Boolean);

  return {
    type: "doc",
    children,
  };
}
