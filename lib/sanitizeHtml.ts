import sanitize from "sanitize-html";

export function sanitizeParagraphHtml(html: string) {
  return sanitize(html, {
    allowedTags: ["b", "strong", "i", "em", "u", "a", "code", "blockquote"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
