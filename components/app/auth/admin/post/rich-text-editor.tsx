"use client";

import {
  Bold,
  Italic,
  Underline,
  Code,
  Quote,
  Link as LinkIcon,
  Unlink,
} from "lucide-react";

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
import { EMPTY_RICH_TEXT_DOC } from "@/types/globalTypes";

interface RichTextDoc {
  type: "doc";
  children: any[];
}

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
    const children = Array.from(root.childNodes).map((node) => {
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
    });

    return {
      type: "doc",
      children: children.filter(Boolean),
    };
  };

  const jsonToHtml = (doc?: RichTextDoc) => {
    if (!doc || !Array.isArray(doc.children)) return "";

    return doc.children
      .map((n: any) => {
        if (n.type === "text") return n.text;

        if (n.type === "paragraph") {
          return `<p>${jsonToHtml({ type: "doc", children: n.children })}</p>`;
        }

        if (n.type === "code") {
          return `<pre><code>${n.text}</code></pre>`;
        }

        if (n.type === "quote") {
          return `<blockquote>${n.text}</blockquote>`;
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
      <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-1">
        <Toggle pressed={active.bold} onPressedChange={() => exec("bold")}>
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle pressed={active.italic} onPressedChange={() => exec("italic")}>
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={active.underline}
          onPressedChange={() => exec("underline")}
        >
          <Underline className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={active.code}
          onPressedChange={() => toggleWrap("code")}
        >
          <Code className="h-4 w-4" />
        </Toggle>
        <Toggle
          pressed={active.quote}
          onPressedChange={() => toggleWrap("blockquote")}
        >
          <Quote className="h-4 w-4" />
        </Toggle>

        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant={active.link ? "default" : "ghost"}
              onMouseDown={saveSelection}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <Label>URL</Label>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://exemplo.com"
            />
            <Button onClick={addLink} className="mt-2 w-full">
              Aplicar
            </Button>
          </PopoverContent>
        </Popover>

        {active.link && (
          <Button size="icon" variant="ghost" onClick={removeLink}>
            <Unlink className="h-4 w-4 text-destructive" />
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
          "min-h-45 rounded-lg border bg-card p-4 outline-none",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground",
          "[&_a]:text-primary [&_a]:underline",
          "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono",
          "[&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic",
        )}
      />
    </div>
  );
}
