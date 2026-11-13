"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PostEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function PostEditor({
  value,
  onChange,
  placeholder = "Comece a escrever o conteúdo completo do post aqui...",
  className,
}: PostEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class:
              "rounded-lg bg-zinc-950 border border-zinc-800 p-4 font-mono text-sm overflow-x-auto text-zinc-100 my-4",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class:
              "border-l-4 border-blue-500 pl-4 py-1 italic my-4 bg-blue-500/5 rounded-r text-muted-foreground",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-6 space-y-1 my-3",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-6 space-y-1 my-3",
          },
        },
        horizontalRule: {
          HTMLAttributes: {
            class: "my-6 border-border",
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class:
            "text-blue-500 underline underline-offset-4 hover:text-blue-400 cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-blue max-w-none focus:outline-none min-h-[420px] p-5 text-foreground text-sm font-sans leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    immediatelyRender: false,
  });

  // Mantém sincronizado caso o valor externo seja carregado/alterado
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="w-full h-80 rounded-xl border border-border bg-card/50 animate-pulse flex items-center justify-center text-muted-foreground text-sm">
        Carregando editor...
      </div>
    );
  }

  const getCurrentHeading = () => {
    if (editor.isActive("heading", { level: 1 })) return "h1";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    return "paragraph";
  };

  const handleHeadingChange = (val: string) => {
    if (val === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else if (val === "h1") {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (val === "h2") {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (val === "h3") {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    }
  };

  const openLinkPopover = () => {
    const prev = editor.getAttributes("link").href || "";
    setLinkUrl(prev);
    setLinkOpen(true);
  };

  const applyLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      let url = linkUrl.trim();
      if (
        !/^https?:\/\//i.test(url) &&
        !url.startsWith("/") &&
        !url.startsWith("#")
      ) {
        url = `https://${url}`;
      }
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
    setLinkOpen(false);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkOpen(false);
  };

  const textContent = editor.getText();
  const wordCount = textContent.trim()
    ? textContent.trim().split(/\s+/).length
    : 0;
  const charCount = textContent.length;

  return (
    <div
      className={cn(
        "w-full rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all focus-within:ring-1 focus-within:ring-primary/40",
        className
      )}
    >
      {/* Barra de Ferramentas / Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 bg-card/95 backdrop-blur-sm border-b border-border/70 select-none">
        {/* Nível de Texto / Peso do Texto */}
        <div className="mr-1">
          <Select
            value={getCurrentHeading()}
            onValueChange={handleHeadingChange}
          >
            <SelectTrigger
              className="h-8 w-[130px] text-xs font-medium bg-muted/40 border-border/60 hover:bg-muted/70"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paragraph" className="text-xs">
                Parágrafo
              </SelectItem>
              <SelectItem value="h1" className="text-xs font-bold">
                Título 1 (H1)
              </SelectItem>
              <SelectItem value="h2" className="text-xs font-bold">
                Título 2 (H2)
              </SelectItem>
              <SelectItem value="h3" className="text-xs font-semibold">
                Título 3 (H3)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[1px] h-5 bg-border/60 mx-1" />

        {/* Formatação Básica de Texto (Negrito, Itálico, Sublinhado, Tachado, Código) */}
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Negrito (Ctrl+B)"
        >
          <i className="bx bx-bold text-base" />
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Itálico (Ctrl+I)"
        >
          <i className="bx bx-italic text-base" />
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Sublinhado (Ctrl+U)"
        >
          <i className="bx bx-underline text-base" />
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Tachado (Ctrl+Shift+X)"
        >
          <i className="bx bx-strikethrough text-base" />
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Código inline (Ctrl+E)"
        >
          <i className="bx bx-code text-base" />
        </ToolbarButton>

        <div className="w-[1px] h-5 bg-border/60 mx-1" />

        {/* Listas e Blocos */}
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Lista com marcadores"
        >
          <i className="bx bx-list-ul text-base" />
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Lista numerada"
        >
          <i className="bx bx-list-ol text-base" />
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Citação"
        >
          <i className="bx bxs-quote-left text-base" />
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Bloco de código (Code block)"
        >
          <i className="bx bx-code-block text-base" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Linha horizontal divisória"
        >
          <i className="bx bx-minus text-base" />
        </ToolbarButton>

        <div className="w-[1px] h-5 bg-border/60 mx-1" />

        {/* Link com Popover */}
        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded text-muted-foreground transition-colors hover:text-foreground hover:bg-muted",
                editor.isActive("link") &&
                  "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary font-medium"
              )}
              onClick={openLinkPopover}
              title="Inserir ou editar link"
            >
              <i className="bx bx-link text-base" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">
                Inserir Link
              </p>
              <Input
                placeholder="https://exemplo.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyLink();
                  }
                }}
                className="h-8 text-xs"
                autoFocus
              />
              <div className="flex items-center justify-between pt-1">
                {editor.isActive("link") ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={removeLink}
                  >
                    Remover link
                  </Button>
                ) : <span />}
                <Button
                  type="button"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={applyLink}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-[1px] h-5 bg-border/60 mx-1" />

        {/* Ações de Histórico & Limpar */}
        <ToolbarButton
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
          title="Desfazer (Ctrl+Z)"
        >
          <i className="bx bx-undo text-base" />
        </ToolbarButton>

        <ToolbarButton
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
          title="Refazer (Ctrl+Y)"
        >
          <i className="bx bx-redo text-base" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
          title="Limpar formatação"
        >
          <i className="bx bx-eraser text-base" />
        </ToolbarButton>
      </div>

      {/* Área de Conteúdo TipTap */}
      <div
        className="min-h-[420px] max-h-[750px] overflow-y-auto cursor-text bg-background/50 focus-within:bg-background/80 transition-colors"
        onClick={() => {
          if (!editor.isFocused) {
            editor.commands.focus();
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Barra de Rodapé / Informações */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground select-none">
        <div className="flex items-center gap-1.5">
          <i className="bx bx-info-circle text-sm text-primary/70" />
          <span>
            Selecione qualquer parte do texto ou palavras para aplicar estilizações.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>{wordCount} palavras</span>
          <span className="opacity-40">•</span>
          <span>{charCount} caracteres</span>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 rounded text-muted-foreground transition-colors hover:text-foreground hover:bg-muted",
        active &&
          "bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary font-medium"
      )}
      disabled={disabled}
      onMouseDown={(e) => {
        // Evita perder a seleção de texto ao clicar nos botões da toolbar
        e.preventDefault();
        onClick();
      }}
      title={title}
    >
      {children}
    </Button>
  );
}
