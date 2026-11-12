"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  filename?: string;
  code: string;
  language?: string;
}

export function CodeBlock({ filename, code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.trimEnd().split("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Erro ao copiar código:", err);
    }
  };

  return (
    <div className="w-full rounded-lg border border-border bg-zinc-950 text-zinc-50 overflow-hidden not-prose my-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-zinc-300">
          <i className="bx bx-file text-sm text-zinc-400" />
          <span>{filename ?? "index.html"}</span>
          {language && (
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] uppercase tracking-wide font-mono text-zinc-300">
              {language}
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
          onClick={handleCopy}
          title="Copiar código"
        >
          {copied ? (
            <i className="bx bx-check text-base text-emerald-400" />
          ) : (
            <i className="bx bx-copy text-base" />
          )}
        </Button>
      </div>

      {/* Corpo do código */}
      <ScrollArea className="max-h-96">
        <pre className="text-sm font-mono bg-zinc-950 px-4 py-3 leading-relaxed">
          <code>
            {lines.map((line, index) => {
              const lineNumber = index + 1;
              return (
                <div key={index} className="flex gap-4 px-2 -mx-2 rounded-sm hover:bg-zinc-900/50">
                  <span className="w-6 text-right select-none opacity-40 text-xs">
                    {lineNumber}
                  </span>
                  <span className="whitespace-pre">
                    {line.length ? line : " "}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </ScrollArea>
    </div>
  );
}
