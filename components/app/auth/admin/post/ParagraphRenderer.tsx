export function ParagraphRenderer({ content }: any) {
  return (
    <p>
      {content.children.map((node: any, i: number) => {
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
            >
              {node.children.map((c: any, j: number) => (
                <span key={j}>{c.text}</span>
              ))}
            </a>
          );
        }

        if (node.type === "code") {
          return <code key={i}>{node.text}</code>;
        }

        if (node.type === "quote") {
          return <blockquote key={i}>{node.text}</blockquote>;
        }

        return null;
      })}
    </p>
  );
}
