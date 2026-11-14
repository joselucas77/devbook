"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  useForm,
  Controller,
  FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CreatePostSchema } from "@/lib/validations/post";
import { slugifySmart } from "@/lib/slugify";
import { PostEditor } from "@/components/posts/editor";

type CreatePostValues = z.infer<typeof CreatePostSchema>;

export function PostForm({
  moduleId,
  technologyId: _technologyId,
  technologySlug,
  technologyName,
  moduleSlug,
  moduleTitle,
  initialPost,
}: {
  moduleId: number;
  technologyId: number;
  technologySlug: string;
  technologyName: string;
  moduleSlug: string;
  moduleTitle: string;
  initialPost: null | {
    id: number;
    title: string;
    slug: string;
    concept: string;
    summary: string;
    image?: string | null;
    isPublic: boolean;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    content: { html?: string; blocks?: unknown[] };
  };
}) {
  const router = useRouter();
  void _technologyId;
  const isEdit = !!initialPost?.id;
  const [imageMode, setImageMode] = useState<"file" | "url">(
    initialPost?.image ? "url" : "file"
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>(
    initialPost?.image ?? ""
  );
  const coverPreviewUrlRef = useRef<string>("");
  coverPreviewUrlRef.current = coverPreviewUrl;
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (coverPreviewUrlRef.current && coverPreviewUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreviewUrlRef.current);
      }
    };
  }, []);

  const form = useForm<CreatePostValues>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: {
      moduleId,
      title: initialPost?.title ?? "",
      slug: initialPost?.slug ?? "",
      concept: initialPost?.concept ?? "",
      summary: initialPost?.summary ?? "",
      image: initialPost?.image ?? "",
      isPublic: initialPost?.isPublic ?? true,
      status: initialPost?.status ?? "DRAFT",
      content: {
        html: initialPost?.content?.html ?? "",
      },
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    shouldFocusError: true,
  });

  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = form;

  const currentImage = watch("image");
  const displayCoverSrc = coverPreviewUrl || currentImage;
  const hasCover = Boolean(selectedCoverFile || coverPreviewUrl || currentImage);

  function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Formato inválido", {
        description: "Selecione um arquivo de imagem.",
      });
      return;
    }

    if (coverPreviewUrl && coverPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreviewUrl);
    }

    const objUrl = URL.createObjectURL(file);
    setSelectedCoverFile(file);
    setCoverPreviewUrl(objUrl);
    setValue("image", "", { shouldValidate: true, shouldDirty: true });
  }

  function handleRemoveCover() {
    if (coverPreviewUrl && coverPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreviewUrl);
    }
    setSelectedCoverFile(null);
    setCoverPreviewUrl("");
    setValue("image", "", { shouldValidate: true, shouldDirty: true });
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  }

  const onSubmit = async (values: CreatePostValues) => {
    let finalImageUrl = values.image || "";

    // Upload da imagem de capa SOMENTE agora ao salvar
    if (imageMode === "file" && selectedCoverFile) {
      setIsUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedCoverFile);

        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err?.message || "Falha no envio da imagem de capa");
        }

        const data = await uploadRes.json();
        finalImageUrl = data.url;
      } catch (err: unknown) {
        setIsUploadingImage(false);
        toast.error("Erro no envio da imagem de capa", {
          description:
            err instanceof Error
              ? err.message
              : "Falha ao enviar imagem. O post não foi salvo.",
        });
        return; // Interrompe para não salvar sem a imagem de capa esperada
      } finally {
        setIsUploadingImage(false);
      }
    }

    try {
      const res = await fetch(
        isEdit ? `/api/admin/posts/${initialPost!.id}` : "/api/admin/posts",
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
        throw new Error(err?.message ?? "Falha ao salvar post");
      }

      toast.success(isEdit ? "Post atualizado" : "Post criado", {
        description: "Dados salvos com sucesso.",
      });

      handleRemoveCover();

      router.push(
        `/admin/tecnologias/${technologySlug}/modulos/${moduleSlug}/posts`
      );
      router.refresh();
    } catch (e: unknown) {
      toast.error("Erro ao salvar post", {
        description:
          e instanceof Error
            ? e.message
            : "Verifique os dados e tente novamente.",
      });
      console.error(e);
    }
  };

  const onInvalid = (errs: FieldErrors<CreatePostValues>) => {
    const contentErrors = errs.content as Record<string, { message?: string }> | undefined;
    const first =
      errs.title?.message ||
      errs.slug?.message ||
      errs.concept?.message ||
      errs.summary?.message ||
      errs.moduleId?.message ||
      errs.content?.html?.message ||
      contentErrors?.html?.message ||
      contentErrors?.message ||
      "Verifique os campos destacados.";

    toast.error("Formulário inválido", { description: String(first) });
  };

  const hasAnyError = useMemo(() => Object.keys(errors).length > 0, [errors]);

  return (
    <section className="max-w-3xl mx-auto mb-20">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-1">
          {isEdit ? "Editar Post" : "Criar Post"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {technologyName} / {moduleTitle}
        </p>
      </div>

      {hasAnyError && (
        <div className="mb-4 text-sm text-rose-500">
          Existem campos inválidos. Clique em “Salvar Post” para ver o motivo.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">
        <Card className="p-4 sm:p-5 space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Módulo</Label>
            <Input type="number" value={moduleId} readOnly className="h-9 bg-muted cursor-not-allowed" />
            <input
              type="hidden"
              {...register("moduleId", { valueAsNumber: true })}
              value={moduleId}
            />
            {errors.moduleId?.message && (
              <p className="text-xs text-destructive">{errors.moduleId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Título</Label>
            <Input placeholder="Ex: Variáveis em PHP" className="h-9" {...register("title")} />
            {errors.title?.message && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Slug</Label>
            <div className="flex gap-2">
              <Input placeholder="ex: variaveis-php" className="h-9" {...register("slug")} />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setValue("slug", slugifySmart(getValues("title")), {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  })
                }
                className="h-9 gap-1.5 shrink-0"
              >
                <i className="bx bx-sparkles text-base" />
                Gerar
              </Button>
            </div>
            {errors.slug?.message && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Conceito</Label>
            <Textarea
              placeholder="Uma frase curta explicando o objetivo do post."
              className="min-h-[70px] resize-y text-sm py-2"
              {...register("concept")}
            />
            {errors.concept?.message && (
              <p className="text-xs text-destructive">{errors.concept.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Resumo</Label>
            <Textarea
              placeholder="Resumo para cards/listagens."
              className="min-h-[70px] resize-y text-sm py-2"
              {...register("summary")}
            />
            {errors.summary?.message && (
              <p className="text-xs text-destructive">{errors.summary.message}</p>
            )}
          </div>

          {/* Imagem de Capa do Post */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Imagem de Capa (Opcional)</Label>
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
              <div className="space-y-1">
                <Input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  disabled={isUploadingImage || isSubmitting}
                  onChange={handleCoverSelect}
                  className="cursor-pointer file:cursor-pointer h-9 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Selecione um arquivo de imagem. O envio para o banco será feito somente ao salvar.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <Input
                  placeholder="https://exemplo.com/banner.png"
                  {...register("image")}
                  disabled={isUploadingImage || isSubmitting}
                  className="h-9"
                />
                <p className="text-[11px] text-muted-foreground">
                  Cole uma URL pública de imagem.
                </p>
              </div>
            )}

            {isUploadingImage && (
              <div className="flex items-center gap-2 text-xs text-blue-500 py-1 font-mono">
                <i className="bx bx-loader-alt animate-spin text-base" />
                Enviando imagem para o Neon Object Storage...
              </div>
            )}

            {hasCover && displayCoverSrc && (
              <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-muted/30 w-full min-w-0 max-w-full overflow-hidden">
                <img
                  src={displayCoverSrc}
                  alt="Prévia"
                  className="h-12 w-20 rounded-md object-cover border border-border bg-background shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p
                    className="text-xs font-medium truncate block max-w-full"
                    title={selectedCoverFile ? selectedCoverFile.name : currentImage}
                  >
                    {selectedCoverFile
                      ? `${selectedCoverFile.name} (${Math.round(selectedCoverFile.size / 1024)} KB)`
                      : currentImage}
                  </p>
                  {selectedCoverFile ? (
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
                  disabled={isUploadingImage || isSubmitting}
                  className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 shrink-0"
                  onClick={handleRemoveCover}
                  title="Remover imagem"
                >
                  <i className="bx bx-trash text-base" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <Switch
                checked={watch("isPublic")}
                onCheckedChange={(v) =>
                  setValue("isPublic", v, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  })
                }
              />
              <div>
                <p className="text-sm font-medium">Post público</p>
                <p className="text-xs text-muted-foreground">
                  Se desativado, só admin vê.
                </p>
              </div>
            </div>

            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <div className="w-[180px] space-y-1">
                  <Label className="text-xs font-medium">Status</Label>
                  <Select
                    value={field.value}
                    onValueChange={(v) =>
                      field.onChange(v as CreatePostValues["status"])
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Rascunho</SelectItem>
                      <SelectItem value="PUBLISHED">Publicado</SelectItem>
                      <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status?.message && (
                    <p className="text-sm text-destructive">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </Card>

        {/* Bloco Único de Conteúdo */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Conteúdo do Post
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Escreva todo o conteúdo em um único bloco. Selecione qualquer parte do texto ou palavras para formatar.
              </p>
            </div>
          </div>

          <Controller
            control={control}
            name="content.html"
            render={({ field }) => (
              <PostEditor
                value={field.value ?? ""}
                onChange={(html) => {
                  field.onChange(html);
                  trigger("content");
                }}
                placeholder="Comece a escrever o conteúdo completo do post aqui... Adicione títulos, negrito, itálico, listas, citações, blocos de código e links de forma livre."
              />
            )}
          />

          {errors.content?.html && (
            <p className="text-sm font-medium text-destructive mt-1.5">
              {errors.content.html.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button type="button" variant="secondary" asChild>
            <Link
              href={`/admin/tecnologias/${technologySlug}/modulos/${moduleSlug}/posts`}
            >
              Cancelar
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="gap-2"
          >
            <i className="bx bx-save text-base" />
            Salvar Post
          </Button>
        </div>
      </form>
    </section>
  );
}
