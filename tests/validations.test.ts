import { describe, it, expect } from "vitest";
import { LoginSchema, RegisterSchema } from "@/lib/validations/auth";
import { CreatePostSchema } from "@/lib/validations/post";
import {
  CreateTechnologySchema,
  UpdateTechnologySchema,
} from "@/lib/validations/technology";

describe("Validations", () => {
  describe("LoginSchema", () => {
    it("valida e-mail e senha válidos", () => {
      const res = LoginSchema.safeParse({
        email: "dev@exemplo.com",
        password: "password123",
      });
      expect(res.success).toBe(true);
    });

    it("rejeita e-mail inválido", () => {
      const res = LoginSchema.safeParse({
        email: "email-invalido",
        password: "password123",
      });
      expect(res.success).toBe(false);
    });

    it("rejeita senha menor que 6 caracteres", () => {
      const res = LoginSchema.safeParse({
        email: "dev@exemplo.com",
        password: "123",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("RegisterSchema", () => {
    it("rejeita senhas divergentes", () => {
      const res = RegisterSchema.safeParse({
        name: "Dev",
        email: "dev@exemplo.com",
        password: "password123",
        confirmPassword: "password456",
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.flatten().fieldErrors.confirmPassword).toContain(
          "As senhas não coincidem"
        );
      }
    });
  });

  describe("CreatePostSchema", () => {
    it("valida payload mínimo de post", () => {
      const res = CreatePostSchema.safeParse({
        moduleId: 1,
        title: "Artigo de Teste",
        slug: "artigo-teste",
        content: {
          html: "<p>Conteúdo</p>",
        },
        isPublic: true,
        status: "DRAFT",
      });
      expect(res.success).toBe(true);
    });

    it("rejeita criação sem título", () => {
      const res = CreatePostSchema.safeParse({
        moduleId: 1,
        title: "",
        slug: "artigo-teste",
        content: { html: "<p>Conteúdo</p>" },
      });
      expect(res.success).toBe(false);
    });
  });

  describe("TechnologySchema", () => {
    it("valida criação de tecnologia com isArchived", () => {
      const res = CreateTechnologySchema.safeParse({
        name: "React",
        slug: "react",
        description: "Biblioteca JavaScript",
        category: "Frameworks & Libs",
        isArchived: true,
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.isArchived).toBe(true);
      }
    });

    it("valida atualização parcial de tecnologia alterando apenas isArchived", () => {
      const res = UpdateTechnologySchema.safeParse({
        isArchived: false,
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.isArchived).toBe(false);
      }
    });
  });
});
