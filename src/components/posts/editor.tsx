"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { toast } from "sonner";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const [tableOpen, setTableOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [, setTick] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class:
              "rounded-xl bg-[#09090b] border border-zinc-800/80 p-4 sm:p-5 font-mono text-xs sm:text-sm overflow-x-auto text-zinc-100 my-4 leading-6",
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
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
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
          "prose dark:prose-invert prose-blue max-w-none focus:outline-none min-h-[420px] p-5 text-foreground text-sm font-sans leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
  });

  // Garante que qualquer transação ou clique no editor re-renderize os botões da toolbar
  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => setTick((t) => t + 1);
    editor.on("transaction", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("transaction", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor]);

  // Mantém sincronizado caso o valor externo seja carregado/alterado
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value || "", { emitUpdate: false });
      if (!value) {
        editor.commands.unsetAllMarks();
      }
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
      editor.chain().focus().setHeading({ level: 1 }).run();
    } else if (val === "h2") {
      editor.chain().focus().setHeading({ level: 2 }).run();
    } else if (val === "h3") {
      editor.chain().focus().setHeading({ level: 3 }).run();
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

      if (editor.state.selection.empty && !editor.isActive("link")) {
        editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      }
    }
    setLinkOpen(false);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkOpen(false);
  };

  const insertTable = (rows: number, cols: number) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
    setTableOpen(false);
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
      <TooltipProvider delayDuration={150}>
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 bg-card/95 backdrop-blur-sm border-b border-border/70 select-none">
          {/* Nível de Texto / Peso do Texto */}
          <div className="mr-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
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
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={6}>
                Formato do bloco (Parágrafo ou Título)
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="w-[1px] h-5 bg-border/60 mx-1" />

          {/* Formatação Básica de Texto (Negrito, Itálico, Sublinhado, Tachado) */}
          <ToolbarButton
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            tooltip="Negrito (Ctrl+B)"
          >
            <i className="bx bx-bold text-base" />
          </ToolbarButton>

          <ToolbarButton
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            tooltip="Itálico (Ctrl+I)"
          >
            <i className="bx bx-italic text-base" />
          </ToolbarButton>

          <ToolbarButton
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            tooltip="Sublinhado (Ctrl+U)"
          >
            <i className="bx bx-underline text-base" />
          </ToolbarButton>

          <ToolbarButton
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            tooltip="Tachado (Ctrl+Shift+X)"
          >
            <i className="bx bx-strikethrough text-base" />
          </ToolbarButton>

          <div className="w-[1px] h-5 bg-border/60 mx-1" />

          {/* Listas e Blocos */}
          <ToolbarButton
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            tooltip="Lista com marcadores"
          >
            <i className="bx bx-list-ul text-base" />
          </ToolbarButton>

          <ToolbarButton
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            tooltip="Lista numerada"
          >
            <i className="bx bx-list-ol text-base" />
          </ToolbarButton>

          <ToolbarButton
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            tooltip="Citação em bloco"
          >
            <i className="bx bxs-quote-left text-base" />
          </ToolbarButton>

          <ToolbarButton
            active={editor.isActive("codeBlock")}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            tooltip="Bloco de código (Code block)"
          >
            <i className="bx bx-code-block text-base" />
          </ToolbarButton>

          {/* Tabela com Popover interativo */}
          <Popover open={tableOpen} onOpenChange={setTableOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded text-muted-foreground transition-colors hover:text-foreground hover:bg-muted",
                      editor.isActive("table") &&
                        "bg-blue-600/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400 font-semibold border border-blue-500/30"
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <i className="bx bx-table text-base" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={6}>
                {editor.isActive("table") ? "Gerenciar tabela" : "Inserir tabela"}
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-64 p-3" align="start">
              {editor.isActive("table") ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-border/60">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <i className="bx bx-table text-blue-500" />
                      Tabela Selecionada
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Linhas
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs justify-start px-2"
                        onClick={() => editor.chain().focus().addRowBefore().run()}
                      >
                        <i className="bx bx-plus mr-1" /> Acima
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs justify-start px-2"
                        onClick={() => editor.chain().focus().addRowAfter().run()}
                      >
                        <i className="bx bx-plus mr-1" /> Abaixo
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-full text-xs text-rose-500 hover:text-rose-600 justify-start px-2"
                      onClick={() => editor.chain().focus().deleteRow().run()}
                    >
                      <i className="bx bx-trash mr-1.5" /> Excluir linha
                    </Button>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-border/40">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Colunas
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs justify-start px-2"
                        onClick={() => editor.chain().focus().addColumnBefore().run()}
                      >
                        <i className="bx bx-plus mr-1" /> À esquerda
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs justify-start px-2"
                        onClick={() => editor.chain().focus().addColumnAfter().run()}
                      >
                        <i className="bx bx-plus mr-1" /> À direita
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-full text-xs text-rose-500 hover:text-rose-600 justify-start px-2"
                      onClick={() => editor.chain().focus().deleteColumn().run()}
                    >
                      <i className="bx bx-trash mr-1.5" /> Excluir coluna
                    </Button>
                  </div>

                  <div className="pt-1.5 border-t border-border/60">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-7 w-full text-xs"
                      onClick={() => {
                        editor.chain().focus().deleteTable().run();
                        setTableOpen(false);
                      }}
                    >
                      <i className="bx bx-trash mr-1.5" /> Excluir tabela inteira
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-border/60">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <i className="bx bx-table text-blue-500" />
                      Inserir Tabela
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground font-medium">
                        Linhas
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={tableRows}
                        onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground font-medium">
                        Colunas
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={tableCols}
                        onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">
                      Atalhos rápidos:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 text-[11px] flex-1 px-1"
                        onClick={() => insertTable(2, 2)}
                      >
                        2 × 2
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 text-[11px] flex-1 px-1"
                        onClick={() => insertTable(3, 3)}
                      >
                        3 × 3
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 text-[11px] flex-1 px-1"
                        onClick={() => insertTable(4, 4)}
                      >
                        4 × 4
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    className="h-7 w-full text-xs"
                    onClick={() => insertTable(tableRows, tableCols)}
                  >
                    Inserir Tabela
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <div className="w-[1px] h-5 bg-border/60 mx-1" />

          {/* Link com Popover */}
          <Popover open={linkOpen} onOpenChange={setLinkOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded text-muted-foreground transition-colors hover:text-foreground hover:bg-muted",
                      editor.isActive("link") &&
                        "bg-blue-600/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400 font-semibold border border-blue-500/30"
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={openLinkPopover}
                  >
                    <i className="bx bx-link text-base" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={6}>
                Inserir ou editar link
              </TooltipContent>
            </Tooltip>
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

          {/* Ações de Histórico & Limpeza */}
          <ToolbarButton
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
            tooltip="Desfazer (Ctrl+Z)"
          >
            <i className="bx bx-undo text-base" />
          </ToolbarButton>

          <ToolbarButton
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
            tooltip="Refazer (Ctrl+Y)"
          >
            <i className="bx bx-redo text-base" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() =>
              editor.chain().focus().unsetAllMarks().clearNodes().run()
            }
            tooltip="Limpar formatação do texto"
          >
            <i className="bx bx-eraser text-base" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => {
              if (editor.isEmpty) {
                toast.info("O editor já está vazio.");
                return;
              }
              if (
                window.confirm(
                  "Tem certeza que deseja apagar todo o conteúdo do post?"
                )
              ) {
                editor.chain().focus().clearContent(true).run();
                toast.success("Conteúdo apagado com sucesso.");
              }
            }}
            tooltip="Apagar todo o conteúdo do post"
          >
            <i className="bx bx-trash text-base text-rose-500 hover:text-rose-600" />
          </ToolbarButton>
        </div>
      </TooltipProvider>

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
  tooltip,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  tooltip: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded text-muted-foreground transition-colors hover:text-foreground hover:bg-muted",
            active &&
              "bg-blue-600/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400 font-semibold border border-blue-500/30"
          )}
          disabled={disabled}
          onMouseDown={(e) => {
            // Evita perder a seleção de texto ao clicar nos botões da toolbar
            e.preventDefault();
          }}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
