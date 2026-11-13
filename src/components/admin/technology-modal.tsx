"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";

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

import { slugifySmart } from "@/lib/slugify";
import {
  CreateTechnologySchema,
  type CreateTechnologyValues,
} from "@/lib/validations/technology";

const TechnologyCategories = [
  {
    label: "Linguagens",
    value: "Linguagens",
    description: "Para a base do código (ex: PHP, JavaScript, Python, SQL)",
  },
  {
    label: "Markups & Estilos",
    value: "Markups & Estilos",
    description: "Para o que define visual e estrutura (ex: HTML, CSS, Markdown)",
  },
  {
    label: "Frameworks & Libs",
    value: "Frameworks & Libs",
    description: "Ferramentas que facilitam o desenvolvimento (ex: React, Laravel, Django)",
  },
  {
    label: "Infra & DevOps",
    value: "Infra & DevOps",
    description: "Tecnologias para infraestrutura e operações (ex: Docker, Vercel, AWS)",
  },
  {
    label: "Gerenciamento de Dados",
    value: "Gerenciamento de Dados",
    description: "Bancos de dados e ferramentas de manipulação de dados (ex: MySQL, MongoDB, Neon)",
  },
  {
    label: "Ferramentas & Utilitários",
    value: "Ferramentas & Utilitários",
    description: "Ferramentas auxiliares para desenvolvimento (ex: Git, Webpack, Postman)",
  },
];

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
  const [imageMode, setImageMode] = useState<"file" | "url">("file");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const previewUrlRef = useRef<string>("");
  previewUrlRef.current = previewUrl;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateTechnologyValues>({
    resolver: zodResolver(CreateTechnologySchema),
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
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = form;

  const currentImage = watch("image");
  const displayImageSrc = previewUrl || currentImage;
  const hasImage = Boolean(selectedFile || previewUrl || currentImage);

  // Limpeza de recursos e sincronização de dados iniciais
  useEffect(() => {
    if (!open) {
      if (previewUrlRef.current && previewUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      setSelectedFile(null);
      setPreviewUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    reset({
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      description: initial?.description ?? "",
      category: initial?.category ?? "",
      image: initial?.image ?? "",
    });
    setSelectedFile(null);
    setPreviewUrl(initial?.image ?? "");
    setImageMode(initial?.image ? "url" : "file");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [open, initial, reset]);

  // Limpa Object URL se o componente for desmontado
  useEffect(() => {
    return () => {
      if (previewUrlRef.current && previewUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Formato inválido", {
        description: "Selecione um arquivo de imagem (PNG, JPG, SVG, WebP...).",
      });
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const objUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objUrl);
    setValue("image", "", { shouldValidate: true, shouldDirty: true });
  }

  function handleRemoveImage() {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    setValue("image", "", { shouldValidate: true, shouldDirty: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function onSubmit(values: CreateTechnologyValues) {
    let finalImageUrl = values.image || "";

    // Upload do arquivo SOMENTE agora ao salvar de fato
    if (imageMode === "file" && selectedFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err?.message || "Falha ao enviar a imagem para o armazenamento.");
        }

        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      } catch (err: unknown) {
        setIsUploading(false);
        toast.error("Erro no envio da imagem", {
          description:
            err instanceof Error
              ? err.message
              : "Não foi possível enviar a imagem. A tecnologia não foi salva.",
        });
        return; // Interrompe para não salvar sem a imagem
      } finally {
        setIsUploading(false);
      }
    }

    try {
      const res = await fetch(
        isEdit
          ? `/api/admin/technologies/${initial!.id}`
          : "/api/admin/technologies",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            image: finalImageUrl,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? "Falha ao salvar tecnologia");
      }

      toast.success(isEdit ? "Tecnologia atualizada" : "Tecnologia criada");
      handleRemoveImage();
      onOpenChange(false);
      onSaved?.();
    } catch (e: unknown) {
      toast.error("Erro ao salvar tecnologia", {
        description: e instanceof Error ? e.message : "Erro inesperado",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl z-200 w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEdit ? "Editar Tecnologia" : "Nova Tecnologia"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Preencha as informações básicas da tecnologia.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full min-w-0 max-w-full">
          <div className="space-y-2 min-w-0">
            <Label>Nome</Label>
            <Input placeholder="Ex: PHP" {...register("name")} />
            {errors.name?.message && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2 min-w-0">
            <Label>Slug</Label>
            <div className="flex gap-2 min-w-0 w-full">
              <Input
                placeholder="ex: php"
                className="min-w-0 flex-1"
                {...register("slug")}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setValue("slug", slugifySmart(getValues("name")), {
                    shouldValidate: true,
                  })
                }
                className="gap-2 shrink-0"
              >
                <i className="bx bx-sparkles text-base" />
                Gerar
              </Button>
            </div>
            {errors.slug?.message && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-1.5">
              <Label>Categoria</Label>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <i className="bx bx-help-circle text-base text-muted-foreground cursor-pointer hover:text-foreground" />
                </HoverCardTrigger>
                <HoverCardContent className="flex w-80 flex-col gap-1 text-xs">
                  {TechnologyCategories.map((cat, index) => (
                    <div key={index} className="text-muted-foreground mt-1">
                      <strong className="text-foreground">{cat.label}</strong>: {cat.description}
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
              <p className="text-xs text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2 min-w-0">
            <Label>Descrição</Label>
            <Textarea
              className="min-h-24 resize-none w-full"
              placeholder="Descrição breve..."
              {...register("description")}
            />
            {errors.description?.message && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Imagem com opção de Upload e URL Externa */}
          <div className="space-y-2 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Label>Imagem / Ícone</Label>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant={imageMode === "file" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 text-xs px-2 gap-1"
                  onClick={() => setImageMode("file")}
                >
                  <i className="bx bx-upload text-sm" /> Upload do PC
                </Button>
                <Button
                  type="button"
                  variant={imageMode === "url" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 text-xs px-2 gap-1"
                  onClick={() => setImageMode("url")}
                >
                  <i className="bx bx-link text-sm" /> Via URL
                </Button>
              </div>
            </div>

            {imageMode === "file" ? (
              <div className="space-y-1 min-w-0">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  disabled={isUploading || isSubmitting}
                  onChange={handleFileSelect}
                  className="cursor-pointer file:cursor-pointer w-full"
                />
                <p className="text-[11px] text-muted-foreground">
                  Selecione um arquivo de imagem do computador. O envio para o banco será feito somente ao clicar em Salvar.
                </p>
              </div>
            ) : (
              <div className="space-y-1 min-w-0">
                <Input
                  placeholder="https://exemplo.com/logo.png"
                  {...register("image")}
                  className="w-full"
                  disabled={isUploading || isSubmitting}
                />
                <p className="text-[11px] text-muted-foreground">
                  Cole uma URL pública de imagem.
                </p>
              </div>
            )}

            {isUploading && (
              <div className="flex items-center gap-2 text-xs text-blue-500 py-1 font-mono">
                <i className="bx bx-loader-alt animate-spin text-base" />
                Enviando imagem para o Neon Object Storage...
              </div>
            )}

            {hasImage && displayImageSrc && (
              <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-muted/30 w-full min-w-0 max-w-full overflow-hidden">
                <img
                  src={displayImageSrc}
                  alt="Prévia"
                  className="h-10 w-10 rounded-md object-contain border border-border bg-background p-1 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p
                    className="text-xs font-medium truncate block max-w-full"
                    title={selectedFile ? selectedFile.name : currentImage}
                  >
                    {selectedFile
                      ? `${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)`
                      : currentImage}
                  </p>
                  {selectedFile ? (
                    <p className="text-[10px] text-amber-500 dark:text-amber-400 flex items-center gap-1 shrink-0">
                      <i className="bx bx-time text-xs shrink-0" />
                      <span>Será enviado ao salvar</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-emerald-500 flex items-center gap-1 shrink-0">
                      <i className="bx bx-check-circle text-xs shrink-0" />
                      <span>Imagem vinculada</span>
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isUploading || isSubmitting}
                  className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 shrink-0"
                  onClick={handleRemoveImage}
                  title="Remover imagem"
                >
                  <i className="bx bx-trash text-base" />
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting || isUploading}
              onClick={() => {
                handleRemoveImage();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading || !isValid}
              className="gap-2 bg-blue-600 hover:bg-blue-600/90 text-white"
            >
              {isUploading ? (
                <>
                  <i className="bx bx-loader-alt animate-spin text-base" />
                  Enviando imagem...
                </>
              ) : isSubmitting ? (
                <>
                  <i className="bx bx-loader-alt animate-spin text-base" />
                  Salvando tecnologia...
                </>
              ) : (
                <>
                  <i className="bx bx-save text-base" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
