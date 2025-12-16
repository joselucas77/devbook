const STOP_WORDS = new Set([
  // artigos
  "o",
  "a",
  "os",
  "as",
  "um",
  "uma",
  "uns",
  "umas",
  // preposições
  "de",
  "da",
  "do",
  "das",
  "dos",
  "em",
  "no",
  "na",
  "nos",
  "nas",
  "por",
  "pra",
  "pro",
  "pras",
  "pros",
  "a",
  "ao",
  "aos",
  "à",
  "às",
  "com",
  "sem",
  "sob",
  "sobre",
  "entre",
  "até",
  "após",
  // conjunções
  "e",
  "ou",
  "mas",
  "nem",
  // pronomes/afins comuns em títulos
  "que",
  "para",
]);

function removeDiacritics(input: string) {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Gera slug “inteligente” (pt-BR) removendo stopwords e acentos.
 * Ex:
 * - "Variáveis em Python" -> "variaveis-python"
 * - "Introdução à POO em PHP" -> "introducao-poo-php"
 */
export function slugifySmart(title: string, fallback = "post") {
  const cleaned = removeDiacritics(title)
    .toLowerCase()
    .replace(/&/g, " e ") // trata "&" como "e" (depois cai em stopword)
    .replace(/['"’`´]/g, "") // remove aspas/apóstrofos
    .replace(/[^a-z0-9]+/g, " ") // tudo que não é letra/número vira espaço
    .trim();

  const words = cleaned
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !STOP_WORDS.has(w));

  const slug = words.join("-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  return slug.length ? slug : fallback;
}
