"use client";

import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CircleQuestionMark, Save, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { slugifySmart } from "@/lib/slugifySmart";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const TechnologyCategories = [
  {
    label: "Linguagens",
    value: "Linguagens",
    description: "Para a base do código (ex: PHP, JavaScript, Python, SQL)",
  },
  {
    label: "Markups & Estilos",
    value: "Markups & Estilos",
    description:
      "Para o que define visual e estrutura (ex: HTML, CSS, Markdown)",
  },
  {
    label: "Frameworks & Libs",
    value: "Frameworks & Libs",
    description:
      "Ferramentas que facilitam o desenvolvimento (ex: React, Laravel, Django)",
  },
  {
    label: "Infra & DevOps",
    value: "Infra & DevOps",
    description:
      "Tecnologias para infraestrutura e operações (ex: Docker, Vercel, AWS)",
  },
  {
    label: "Gerenciamento de Dados",
    value: "Gerenciamento de Dados",
    description:
      "Bancos de dados e ferramentas de manipulação de dados (ex: MySQL, MongoDB, Supabase)",
  },
  {
    label: "Ferramentas & Utilitários",
    value: "Ferramentas & Utilitários",
    description:
      "Ferramentas auxiliares para desenvolvimento (ex: Git, Webpack, Postman)",
  },
];

const TechnologySchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  slug: z
    .string()
    .min(2, "Slug obrigatório")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido"),
  description: z.string().min(5, "Descrição obrigatória"),
  category: z.string().min(2, "Categoria obrigatória"),
  image: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type TechnologyFormValues = z.infer<typeof TechnologySchema>;

export type TechnologyRow = {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  image: string | null;
};

export function TechnologyModal({
  open,
  onOpenChange,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: TechnologyRow | null; // se tiver, é edição
  onSaved?: () => void; // callback para refetch/refresh tabela
}) {
  const isEdit = !!initial?.id;

  const form = useForm<TechnologyFormValues>({
    resolver: zodResolver(TechnologySchema),
    defaultValues: {
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      description: initial?.description ?? "",
      category: initial?.category ?? "",
      image: initial?.image ?? "",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = form;

  useEffect(() => {
    // quando abrir modal com initial, reseta o form
    if (!open) return;
    reset({
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      description: initial?.description ?? "",
      category: initial?.category ?? "",
      image: initial?.image ?? "",
    });
  }, [open, initial, reset]);

  async function onSubmit(values: TechnologyFormValues) {
    try {
      const res = await fetch(
        isEdit
          ? `/api/admin/technologies/${initial!.id}`
          : "/api/admin/technologies",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? "Falha ao salvar tecnologia");
      }

      toast.success(isEdit ? "Tecnologia atualizada" : "Tecnologia criada");
      onOpenChange(false);
      onSaved?.();
    } catch (e: any) {
      toast.error("Erro ao salvar tecnologia", { description: e?.message });
      console.error(e);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-155 z-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEdit ? "Editar Tecnologia" : "Nova Tecnologia"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Preencha as informações básicas da tecnologia.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input placeholder="Ex: PHP" {...register("name")} />
            {errors.name?.message && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <div className="flex gap-2">
              <Input placeholder="ex: php" {...register("slug")} />
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setValue("slug", slugifySmart(getValues("name")), {
                    shouldValidate: true,
                  })
                }
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Gerar
              </Button>
            </div>
            {errors.slug?.message && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex gap-1">
              <Label>Categoria</Label>
              <HoverCard>
                <HoverCardTrigger>
                  <CircleQuestionMark className="w-4 h-4 cursor-pointer" />
                </HoverCardTrigger>
                <HoverCardContent className="flex w-full flex-col gap-0.5">
                  {TechnologyCategories.map((cat, index) => (
                    <div
                      key={index}
                      className="text-muted-foreground mt-1 text-sm"
                    >
                      <strong>{cat.label}</strong>: {cat.description}
                    </div>
                  ))}
                </HoverCardContent>
              </HoverCard>
            </div>
            <Controller
              control={form.control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>

                  <SelectContent>
                    {TechnologyCategories.map((cat, index) => (
                      <SelectItem key={index} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            {errors.category?.message && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              className="min-h-27.5"
              placeholder="Descrição breve..."
              {...register("description")}
            />
            {errors.description?.message && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Imagem (URL opcional)</Label>
            <Input placeholder="https://..." {...register("image")} />
            {errors.image?.message && (
              <p className="text-sm text-red-500">{errors.image.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
