"use client";

import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  EMPTY_RICH_TEXT_DOC,
  RichTextDoc,
  RichTextNode,
} from "@/types/post";

interface RichTextEditorProps {
  value: RichTextDoc;
  onChange: (value: RichTextDoc) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Digite seu texto...",
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);

  const [active, setActive] = useState({
    bold: false,
    italic: false,
    underline: false,
    code: false,
    quote: false,
    link: false,
  });

  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  const queryState = (cmd: string) => {
    try {
      return document.queryCommandState(cmd);
    } catch {
      return false;
    }
  };

  const execCommand = (cmd: string) => {
    try {
      document.execCommand(cmd);
    } catch {}
  };

  const domToJson = (root: HTMLElement): RichTextDoc => {
    const children = Array.from(root.childNodes).map(
      (node): RichTextNode | null => {
        if (node.nodeType === Node.TEXT_NODE) {
          return { type: "text", text: node.textContent ?? "" };
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;

          if (el.tagName === "CODE") {
            return { type: "code", text: el.textContent ?? "" };
          }

          if (el.tagName === "BLOCKQUOTE") {
            return { type: "quote", text: el.textContent ?? "" };
          }

          if (el.tagName === "A") {
            return {
              type: "link",
              href: el.getAttribute("href") ?? "",
              children: [{ type: "text", text: el.textContent ?? "" }],
            };
          }

          return { type: "text", text: el.textContent ?? "" };
        }

        return null;
      }
    );

    return {
      type: "doc",
      children: children.filter((n): n is RichTextNode => n !== null),
    };
  };

  const jsonToHtml = (doc?: RichTextDoc): string => {
    if (!doc || !Array.isArray(doc.children)) return "";

    return doc.children
      .map((n: RichTextNode) => {
        if (n.type === "text") {
          return n.text;
        }

        if (n.type === "paragraph") {
          return `<p>${jsonToHtml({ type: "doc", children: n.children })}</p>`;
        }

        if (n.type === "code") {
          return `<pre><code>${n.text}</code></pre>`;
        }

        if (n.type === "quote") {
          return `<blockquote>${n.text}</blockquote>`;
        }

        if (n.type === "link") {
          return `<a href="${n.href}" target="_blank" rel="noopener noreferrer">${jsonToHtml({ type: "doc", children: n.children })}</a>`;
        }

        return "";
      })
      .join("");
  };

  const updateActive = useCallback(() => {
    const sel = window.getSelection();
    const parent = sel?.anchorNode?.parentElement;

    setActive({
      bold: queryState("bold"),
      italic: queryState("italic"),
      underline: queryState("underline"),
      code: !!parent?.closest("code"),
      quote: !!parent?.closest("blockquote"),
      link: !!parent?.closest("a"),
    });
  }, []);

  const exec = (cmd: string) => {
    editorRef.current?.focus();
    execCommand(cmd);
    updateActive();
    if (editorRef.current) {
      onChange(domToJson(editorRef.current));
    }
  };

  const toggleWrap = (tag: "code" | "blockquote") => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const parent = sel.anchorNode?.parentElement;
    const existing = parent?.closest(tag);

    if (existing) {
      existing.replaceWith(document.createTextNode(existing.textContent ?? ""));
    } else {
      const el = document.createElement(tag);
      range.surroundContents(el);
    }

    updateActive();
    if (editorRef.current) {
      onChange(domToJson(editorRef.current));
    }
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    if (!savedRange.current) return;
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(savedRange.current);
  };

  const addLink = () => {
    if (!linkUrl) return;
    editorRef.current?.focus();
    restoreSelection();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    if (!range.toString()) return;

    const a = document.createElement("a");
    a.href = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    range.surroundContents(a);

    setLinkUrl("");
    setLinkOpen(false);
    updateActive();
    if (editorRef.current) {
      onChange(domToJson(editorRef.current));
    }
  };

  const removeLink = () => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    const link = sel?.anchorNode?.parentElement?.closest("a");
    if (!link) return;

    link.replaceWith(document.createTextNode(link.textContent ?? ""));
    updateActive();
    if (editorRef.current) {
      onChange(domToJson(editorRef.current));
    }
  };

  useEffect(() => {
    if (!editorRef.current) return;

    const safeValue = value?.children ? value : EMPTY_RICH_TEXT_DOC;
    editorRef.current.innerHTML = jsonToHtml(safeValue);
  }, [value]);

  useEffect(() => {
    document.addEventListener("selectionchange", updateActive);
    return () => document.removeEventListener("selectionchange", updateActive);
  }, [updateActive]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
        <Toggle
          size="sm"
          pressed={active.bold}
          onPressedChange={() => exec("bold")}
          title="Negrito"
        >
          <i className="bx bx-bold text-base" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={active.italic}
          onPressedChange={() => exec("italic")}
          title="Itálico"
        >
          <i className="bx bx-italic text-base" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={active.underline}
          onPressedChange={() => exec("underline")}
          title="Sublinhado"
        >
          <i className="bx bx-underline text-base" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={active.code}
          onPressedChange={() => toggleWrap("code")}
          title="Código inline"
        >
          <i className="bx bx-code text-base" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={active.quote}
          onPressedChange={() => toggleWrap("blockquote")}
          title="Citação"
        >
          <i className="bx bxs-quote-alt-left text-base" />
        </Toggle>

        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant={active.link ? "default" : "ghost"}
              onMouseDown={saveSelection}
              title="Inserir link"
              className="h-8 w-8 p-0"
            >
              <i className="bx bx-link text-base" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <Label className="text-xs">URL do link</Label>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://exemplo.com"
              className="mt-1"
            />
            <Button onClick={addLink} size="sm" className="mt-2 w-full">
              Aplicar link
            </Button>
          </PopoverContent>
        </Popover>

        {active.link && (
          <Button
            size="sm"
            variant="ghost"
            onClick={removeLink}
            title="Remover link"
            className="h-8 w-8 p-0"
          >
            <i className="bx bx-unlink text-base text-destructive" />
          </Button>
        )}
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={() => {
          if (editorRef.current) {
            onChange(domToJson(editorRef.current));
          }
        }}
        data-placeholder={placeholder}
        className={cn(
          "min-h-36 rounded-lg border border-input bg-card p-4 outline-none focus:ring-1 focus:ring-ring text-sm",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground",
          "[&_a]:text-blue-500 [&_a]:underline",
          "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-blue-500 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground"
        )}
      />
    </div>
  );
}
