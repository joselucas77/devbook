import { describe, it, expect } from "vitest";
import { slugifySmart } from "@/lib/slugify";

describe("slugifySmart", () => {
  it("converte texto com acentos e maiúsculas para slug limpo", () => {
    expect(slugifySmart("Introdução ao Next.js")).toBe("introducao-next-js");
  });

  it("remove stopwords em português", () => {
    expect(slugifySmart("Variáveis em Python")).toBe("variaveis-python");
    expect(slugifySmart("Introdução à POO em PHP")).toBe("introducao-poo-php");
  });

  it("trata caracteres especiais e pontuação", () => {
    expect(slugifySmart("React & Vue: Qual escolher?")).toBe(
      "react-vue-qual-escolher"
    );
  });

  it("retorna fallback caso o resultado seja vazio", () => {
    expect(slugifySmart("", "fallback-slug")).toBe("fallback-slug");
  });
});
