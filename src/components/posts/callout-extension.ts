import { Node, mergeAttributes } from "@tiptap/core";

export type CalloutType = "info" | "tip" | "warning" | "danger";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attributes?: { type?: CalloutType }) => ReturnType;
      toggleCallout: (attributes?: { type?: CalloutType }) => ReturnType;
    };
  }
}

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      type: {
        default: "info",
        parseHTML: (element) =>
          element.getAttribute("data-callout") ||
          (element.classList.contains("callout-tip")
            ? "tip"
            : element.classList.contains("callout-warning")
            ? "warning"
            : element.classList.contains("callout-danger")
            ? "danger"
            : "info"),
        renderHTML: (attributes) => ({
          "data-callout": attributes.type,
          class: `callout callout-${attributes.type}`,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-callout]",
      },
      {
        tag: "div.callout",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setCallout:
        (attributes = {}) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, attributes);
        },
      toggleCallout:
        (attributes = {}) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, attributes);
        },
    };
  },
});
