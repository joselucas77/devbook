import { codeToHtml } from "shiki";

/**
 * Mapeia aliases comuns para linguagens suportadas pelo Shiki
 */
const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  rb: "ruby",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  docker: "dockerfile",
  md: "markdown",
  postgres: "sql",
  postgresql: "sql",
};

/**
 * Converte código em HTML com realce de sintaxe profissional (Shiki).
 * Executado no servidor para não onerar o bundle do cliente com gramáticas e wasm.
 */
export async function highlightCode(
  code: string,
  language?: string
): Promise<string> {
  const cleanCode = (code ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rawLang = (language ?? "text").toLowerCase().trim();
  const lang = LANGUAGE_ALIASES[rawLang] || rawLang;

  try {
    return await codeToHtml(cleanCode, {
      lang,
      theme: "github-dark",
    });
  } catch {
    // Se a linguagem não for reconhecida, faz fallback seguro para 'text'
    try {
      return await codeToHtml(cleanCode, {
        lang: "text",
        theme: "github-dark",
      });
    } catch {
      return `<pre><code>${cleanCode}</code></pre>`;
    }
  }
}
