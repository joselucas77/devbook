import { describe, it, expect } from "vitest";
import {
  formatDateBR,
  formatDatePtBR,
  parseBrasiliaDateTime,
} from "@/lib/format-date";

describe("format-date", () => {
  it("formata data no padrão dd/mm/yyyy", () => {
    const d = new Date(2026, 10, 20); // 20 de Novembro de 2026
    const res = formatDateBR(d);
    expect(res).toBe("20/11/2026");
  });

  it("converte string ISO ou Date com timeZone America/Sao_Paulo", () => {
    const iso = "2026-11-20T12:00:00.000Z";
    const res = formatDatePtBR(iso);
    expect(res).toBe("20/11/2026");
  });

  it("faz o parse de string no fuso de Brasília", () => {
    const parsed = parseBrasiliaDateTime("2026-11-20T15:30");
    expect(parsed).not.toBeNull();
    expect(parsed?.toISOString()).toContain("2026-11-20");
  });

  it("retorna null para valores vazios ou inválidos no parse", () => {
    expect(parseBrasiliaDateTime("")).toBeNull();
    expect(parseBrasiliaDateTime(null)).toBeNull();
    expect(parseBrasiliaDateTime("invalid-date-format")).toBeNull();
  });
});
