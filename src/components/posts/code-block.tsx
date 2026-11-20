"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  highlightedHtml?: string;
  className?: string;
}

export function CodeBlock({
  code,
  language,
  filename,
  highlightedHtml,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const cleanCode = (code ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd();
  const lineCount = cleanCode.split("\n").length;
  const isSingleLine = lineCount <= 1;

  const displayLanguage = (language || "").toLowerCase().trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar código:", err);
    }
  };

  return (
    <div
      className={cn(
        "group relative my-6 w-full max-w-full min-w-0 rounded-xl border border-zinc-800/80 bg-[#09090b] text-zinc-100 not-prose overflow-hidden shadow-sm",
        className
      )}
    >
      {/* Barra de cabeçalho: Linguagem, Nome do Arquivo e Botão Copiar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-4 py-2 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          {displayLanguage && (
            <span className="font-mono font-semibold uppercase tracking-wider text-sky-400 bg-sky-950/50 border border-sky-800/40 px-2 py-0.5 rounded text-[10px]">
              {displayLanguage}
            </span>
          )}
          {filename && (
            <span className="font-mono text-zinc-400 truncate text-[11px]">
              {filename}
            </span>
          )}
        </div>

        {/* Botão Copiar */}
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleCopy}
                aria-label={copied ? "Código copiado" : "Copiar código"}
                className={cn(
                  "flex h-7 items-center gap-1.5 px-2 rounded-md border text-xs transition-all duration-200 cursor-pointer",
                  "border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100",
                  copied &&
                    "border-emerald-500/50 bg-emerald-950/60 text-emerald-400 hover:text-emerald-300"
                )}
              >
                {copied ? (
                  <>
                    <i className="bx bx-check text-base text-emerald-400" />
                    <span className="text-[11px] font-medium">Copiado</span>
                  </>
                ) : (
                  <>
                    <i className="bx bx-copy text-sm" />
                    <span className="text-[11px] font-medium">Copiar</span>
                  </>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              sideOffset={8}
              className="text-xs bg-zinc-900 text-zinc-100 border-zinc-800"
            >
              {copied ? "Copiado para a área de transferência!" : "Copiar código"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Conteúdo do Código */}
      <div className="overflow-x-auto max-w-full p-4 font-mono text-xs sm:text-sm leading-6">
        {highlightedHtml ? (
          <div
            className={cn(
              "shiki-wrapper",
              isSingleLine && "shiki-single-line"
            )}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre className="text-zinc-100 whitespace-pre">
            <code>{cleanCode}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
