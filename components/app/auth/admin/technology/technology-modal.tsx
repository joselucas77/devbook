"use client";

import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CircleQuestionMark,
  Save,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";

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
import { useEffect, useState } from "react";
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

// (O TechnologyCategories continua igual, omiti para poupar espaço)
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
  // O schema continua igual! Vai continuar a validar o URL final.
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
  initial?: TechnologyRow | null;
  onSaved?: () => void;
}) {
  const isEdit = !!initial?.id;

  // Novo estado para armazenar o ficheiro selecionado localmente
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
    if (!open) return;
    reset({
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      description: initial?.description ?? "",
      category: initial?.category ?? "",
      image: initial?.image ?? "",
    });
    // Limpamos o ficheiro sempre que o modal abre
    setSelectedFile(null);
  }, [open, initial, reset]);

  async function onSubmit(values: TechnologyFormValues) {
    try {
      let finalImageUrl = values.image; // Assume o URL atual por defeito

      // Se o utilizador tiver escolhido uma imagem nova do computador
      if (selectedFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        // Dispara a requisição silenciosa para a nossa rota de upload
        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Falha ao fazer o upload da imagem.");
        }

        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url; // Substituímos o valor pelo URL novo do Vercel Blob
        setIsUploading(false);
      }

      // Agora submetemos para a sua rota antiga, com os dados normais,
      // mas o 'image' agora contém o URL gerado!
      const payload = { ...values, image: finalImageUrl };

      const res = await fetch(
        isEdit
          ? `/api/admin/technologies/${initial!.id}`
          : "/api/admin/technologies",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
      setIsUploading(false);
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

          {/* NOVO CAMPO DE IMAGEM */}
          <div className="space-y-2">
            <Label>Imagem / Ícone</Label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }}
              />
              {/* Feedback visual caso já exista imagem registada mas nenhum ficheiro novo */}
              {initial?.image && !selectedFile && (
                <div className="text-xs text-green-500 flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" /> Imagem atual guardada
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Selecione um ficheiro do seu computador para fazer upload
              automaticamente.
            </p>
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
              disabled={isSubmitting || isUploading || !isValid}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isUploading ? "A processar imagem..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
