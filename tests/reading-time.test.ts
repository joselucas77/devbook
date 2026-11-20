import { describe, it, expect } from "vitest";
import { calculateReadingTime } from "@/components/posts/post-actions";

describe("calculateReadingTime", () => {
  it("retorna no mínimo 1 minuto para textos curtos ou vazios", () => {
    expect(calculateReadingTime("")).toBe(1);
    expect(calculateReadingTime("Olá mundo")).toBe(1);
  });

  it("calcula corretamente com base em ~200 palavras por minuto", () => {
    // 400 palavras devem dar 2 minutos
    const words = Array(400).fill("palavra").join(" ");
    expect(calculateReadingTime(words)).toBe(2);
  });

  it("ignora tags HTML ao contar palavras", () => {
    const html = `<p>${Array(250).fill("código").join(" ")}</p><div><span>teste</span></div>`;
    expect(calculateReadingTime(html)).toBe(2);
  });
});
