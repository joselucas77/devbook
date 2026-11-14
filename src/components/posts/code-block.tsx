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
  className?: string;
}

const TAG_REGEX =
  /^(<\/?)([a-zA-Z0-9_:-]+)((?:\s+[a-zA-Z0-9_:-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*)(\/?>)$/;

const TOKENS_REGEX =
  /(<\?php|\?>)|(\/\/[^\n]*|<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/)|("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`)|(\$[a-zA-Z0-9_]+)|(<!DOCTYPE\s+html>)|(<\/?[a-zA-Z0-9_:-]+(?:\s+[a-zA-Z0-9_:-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*\/?>)|(\b(?:echo|print|return|function|const|let|var|if|else|for|while|foreach|as|switch|case|break|continue|new|class|public|private|protected|static|extends|implements|import|export|from|default|try|catch|finally|throw|typeof|instanceof|async|await)\b)|(\b(?:true|false|null|undefined)\b)|(\b\d+(?:\.\d+)?\b)/g;

function renderHighlightedTokens(line: string) {
  if (!line) return " ";

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  TOKENS_REGEX.lastIndex = 0;

  while ((match = TOKENS_REGEX.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`p-${lastIndex}`} className="text-zinc-100">
          {line.slice(lastIndex, match.index)}
        </span>
      );
    }

    const key = `t-${match.index}`;

    if (match[1]) {
      // <?php ou ?>
      parts.push(
        <span key={key} className="text-rose-400 font-semibold">
          {match[1]}
        </span>
      );
    } else if (match[2]) {
      // Comentários
      parts.push(
        <span key={key} className="text-zinc-500 italic">
          {match[2]}
        </span>
      );
    } else if (match[3]) {
      // Strings
      parts.push(
        <span key={key} className="text-emerald-400">
          {match[3]}
        </span>
      );
    } else if (match[4]) {
      // Variáveis PHP / Shell ($nome)
      parts.push(
        <span key={key} className="text-sky-300 font-medium">
          {match[4]}
        </span>
      );
    } else if (match[5]) {
      // <!DOCTYPE html>
      parts.push(
        <span key={key} className="text-zinc-400 font-medium">
          {match[5]}
        </span>
      );
    } else if (match[6]) {
      // Tag HTML / JSX (ex: <Tooltip>, </p>, <meta charset="UTF-8">)
      const tagStr = match[6];
      const tagMatch = TAG_REGEX.exec(tagStr);
      if (tagMatch) {
        const [_, openB, name, attrs, closeB] = tagMatch;
        const subParts: React.ReactNode[] = [
          <span key="ob" className="text-zinc-400">
            {openB}
          </span>,
          <span key="tn" className="text-amber-400 font-normal">
            {name}
          </span>,
        ];

        if (attrs && attrs.trim()) {
          const attrRegex =
            /([a-zA-Z0-9_:-]+)(?:(=)("[^"]*"|'[^']*'|[^\s>]+))?/g;
          let lastAttr = 0;
          let mAttr: RegExpExecArray | null;

          while ((mAttr = attrRegex.exec(attrs)) !== null) {
            if (mAttr.index > lastAttr) {
              subParts.push(
                <span key={`ap-${lastAttr}`} className="text-zinc-100">
                  {attrs.slice(lastAttr, mAttr.index)}
                </span>
              );
            }
            subParts.push(
              <span key={`an-${mAttr.index}`} className="text-sky-300">
                {mAttr[1]}
              </span>
            );
            if (mAttr[2]) {
              subParts.push(
                <span key={`eq-${mAttr.index}`} className="text-zinc-400">
                  {mAttr[2]}
                </span>
              );
            }
            if (mAttr[3]) {
              subParts.push(
                <span key={`av-${mAttr.index}`} className="text-emerald-400">
                  {mAttr[3]}
                </span>
              );
            }
            lastAttr = attrRegex.lastIndex;
          }

          if (lastAttr < attrs.length) {
            subParts.push(
              <span key={`ap-end`} className="text-zinc-100">
                {attrs.slice(lastAttr)}
              </span>
            );
          }
        }

        subParts.push(
          <span key="cb" className="text-zinc-400">
            {closeB}
          </span>
        );

        parts.push(<span key={key}>{subParts}</span>);
      } else {
        parts.push(
          <span key={key} className="text-amber-400 font-normal">
            {tagStr}
          </span>
        );
      }
    } else if (match[7]) {
      // Palavras-chave (echo, print, return, const, let, function, etc.)
      parts.push(
        <span key={key} className="text-sky-400 font-medium">
          {match[7]}
        </span>
      );
    } else if (match[8]) {
      // Constantes (true, false, null, undefined)
      parts.push(
        <span key={key} className="text-yellow-400">
          {match[8]}
        </span>
      );
    } else if (match[9]) {
      // Números
      parts.push(
        <span key={key} className="text-amber-300">
          {match[9]}
        </span>
      );
    }

    lastIndex = TOKENS_REGEX.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push(
      <span key={`p-end`} className="text-zinc-100">
        {line.slice(lastIndex)}
      </span>
    );
  }

  return parts;
}

export function CodeBlock({
  code,
  language: _language,
  filename: _filename,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const cleanCode = (code ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = cleanCode.trimEnd().split("\n");
  const isSingleLine = lines.length <= 1;

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
        "group relative my-6 w-full rounded-xl border border-zinc-800/80 bg-[#09090b] text-zinc-100 not-prose overflow-hidden shadow-sm selection:bg-blue-600/30 selection:text-white",
        className
      )}
    >
      {/* Botão de Copiar Código (canto superior direito) */}
      <div className="absolute top-3 right-3 z-10">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleCopy}
                aria-label={copied ? "Código copiado" : "Copiar código"}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200 cursor-pointer",
                  "border-zinc-800/80 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100",
                  copied &&
                    "border-emerald-500/50 bg-emerald-950/60 text-emerald-400 hover:text-emerald-300"
                )}
              >
                {copied ? (
                  <i className="bx bx-check text-lg text-emerald-400" />
                ) : (
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              sideOffset={8}
              className="text-xs bg-zinc-900 text-zinc-100 border-zinc-800"
            >
              {copied ? "Copiado!" : "Copiar código"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Área do Código com Suporte a Scroll Horizontal */}
      <div className="overflow-x-auto p-4 sm:p-5">
        <div className="w-fit min-w-full font-mono text-xs sm:text-sm leading-6">
          {isSingleLine ? (
            /* Bloco de linha única: sem numeração de linha */
            <div className="flex pr-12 text-zinc-100 whitespace-pre">
              {renderHighlightedTokens(lines[0] || "")}
            </div>
          ) : (
            /* Bloco de múltiplas linhas: com numeração */
            lines.map((line, index) => {
              const lineNumber = index + 1;
              return (
                <div
                  key={index}
                  className="flex -mx-2 px-2 rounded-sm hover:bg-zinc-900/40 transition-colors"
                >
                  <span className="w-7 sm:w-9 pr-3 sm:pr-4 text-right select-none text-zinc-500/70 font-mono text-xs sm:text-sm shrink-0">
                    {lineNumber}
                  </span>
                  <span className="flex-1 whitespace-pre pr-12 text-zinc-100">
                    {renderHighlightedTokens(line)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
