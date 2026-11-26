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
import { formatForDateTimeLocal } from "@/lib/format-date";
import { PostEditor } from "@/components/posts/editor";
import {
  PostSchedulePicker,
  getBrasiliaNow,
} from "@/components/admin/post-schedule-picker";

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
    concept?: string | null;
    summary?: string;
    image?: string | null;
    isPublic: boolean;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SCHEDULED";
    scheduledFor?: string | null;
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
      scheduledFor: initialPost?.scheduledFor
        ? formatForDateTimeLocal(initialPost.scheduledFor)
        : "",
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

  // Chave única para o rascunho no localStorage
  const storageKey = useMemo(() => {
    return isEdit
      ? `devbook_post_draft_edit_${initialPost?.id}`
      : `devbook_post_draft_new_${technologySlug}_${moduleSlug}_${moduleId}`;
  }, [isEdit, initialPost?.id, technologySlug, moduleSlug, moduleId]);

  const [lastSavedDraft, setLastSavedDraft] = useState<string | null>(null);
  const isSubmittedRef = useRef(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Restaura dados do localStorage na inicialização (apenas no cliente)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (!parsed || typeof parsed !== "object") return;

      const hasContent =
        Boolean(parsed.title?.trim()) ||
        Boolean(parsed.contentHtml?.trim()) ||
        Boolean(parsed.summary?.trim()) ||
        Boolean(parsed.slug?.trim());

      if (hasContent) {
        if (parsed.title) setValue("title", parsed.title, { shouldDirty: true, shouldValidate: true });
        if (parsed.slug) setValue("slug", parsed.slug, { shouldDirty: true, shouldValidate: true });
        if (parsed.summary) setValue("summary", parsed.summary, { shouldDirty: true });
        if (parsed.isPublic !== undefined) setValue("isPublic", parsed.isPublic, { shouldDirty: true });
        if (parsed.status) setValue("status", parsed.status, { shouldDirty: true });
        if (parsed.scheduledFor) setValue("scheduledFor", parsed.scheduledFor, { shouldDirty: true });
        if (parsed.contentHtml) {
          setValue("content.html", parsed.contentHtml, { shouldDirty: true, shouldValidate: true });
        }
        if (parsed.image && !initialPost?.image) {
          setValue("image", parsed.image, { shouldDirty: true });
        }
        if (parsed.savedAt) {
          const date = new Date(parsed.savedAt);
          setLastSavedDraft(
            date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          );
        }
        toast.info("Rascunho recuperado", {
          description: "Os dados foram restaurados do armazenamento local do navegador.",
          duration: 5000,
        });
      }
    } catch (e) {
      console.warn("Falha ao recuperar rascunho do localStorage:", e);
    }
  }, [storageKey, setValue, initialPost?.image]);

  // Salva automaticamente no localStorage com debounce de 800ms
  const watchedTitle = watch("title");
  const watchedSlug = watch("slug");
  const watchedSummary = watch("summary");
  const watchedIsPublic = watch("isPublic");
  const watchedStatus = watch("status");
  const watchedScheduledFor = watch("scheduledFor");
  const watchedImage = watch("image");
  const watchedContentHtml = watch("content.html");

  useEffect(() => {
    if (isSubmittedRef.current) return;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      if (isSubmittedRef.current) return;
      try {
        const payload = {
          title: watchedTitle ?? "",
          slug: watchedSlug ?? "",
          summary: watchedSummary ?? "",
          isPublic: watchedIsPublic ?? true,
          status: watchedStatus ?? "DRAFT",
          scheduledFor: watchedScheduledFor ?? "",
          contentHtml: watchedContentHtml ?? "",
          image: watchedImage ?? "",
          savedAt: new Date().toISOString(),
        };

        const hasContent =
          Boolean(payload.title.trim()) ||
          Boolean(payload.contentHtml.trim()) ||
          Boolean(payload.summary.trim()) ||
          Boolean(payload.slug.trim());

        if (hasContent) {
          localStorage.setItem(storageKey, JSON.stringify(payload));
          setLastSavedDraft(
            new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          );
        }
      } catch (e) {
        console.warn("Erro ao salvar rascunho no localStorage:", e);
      }
    }, 800);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [
    storageKey,
    watchedTitle,
    watchedSlug,
    watchedSummary,
    watchedIsPublic,
    watchedStatus,
    watchedScheduledFor,
    watchedImage,
    watchedContentHtml,
  ]);

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(storageKey);
      setLastSavedDraft(null);
      form.reset({
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
      });
      toast.success("Rascunho descartado", {
        description: "Os campos foram restaurados para os valores originais.",
      });
    } catch (e) {
      console.warn("Erro ao descartar rascunho:", e);
    }
  };

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
      let scheduledForIso: string | null = null;
      if (values.status === "SCHEDULED" && values.scheduledFor) {
        let str = values.scheduledFor.trim();
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) {
          str += ":00-03:00";
        } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(str)) {
          str += "-03:00";
        }
        const parsedD = new Date(str);
        if (!isNaN(parsedD.getTime())) {
          scheduledForIso = parsedD.toISOString();
        }
      }

      const res = await fetch(
        isEdit ? `/api/admin/posts/${initialPost!.id}` : "/api/admin/posts",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            moduleId: Number(values.moduleId || moduleId),
            image: finalImageUrl,
            scheduledFor: scheduledForIso,
          }),
        }
      );

      if (!res.ok) {
        let err: any = {};
        let rawText = "";
        try {
          rawText = await res.text();
          err = JSON.parse(rawText);
        } catch {
          err = {};
        }

        console.error("Erro na resposta da API ao salvar post:", {
          status: res.status,
          statusText: res.statusText,
          rawText,
          err,
        });

        let title = "Erro ao salvar post";
        let description =
          err?.message ||
          (rawText && rawText.length < 250 && !rawText.trim().startsWith("<") ? rawText : "") ||
          "Ocorreu um erro no servidor ao tentar salvar o post.";

        if (res.status === 409) {
          title = "Conflito: Slug já existe";
          description =
            err?.message ||
            "Já existe um post cadastrado com este slug neste módulo. Escolha outro slug ou altere o título.";
        } else if (res.status === 400) {
          title = "Dados inválidos";
          if (err?.fieldErrors && typeof err.fieldErrors === "object") {
            const list = Object.entries(err.fieldErrors)
              .map(([field, errList]) => `• ${field}: ${(errList as string[]).join(", ")}`)
              .join("\n");
            description = `${err.message || "Campos com problemas"}:\n${list}`;
          }
        } else if (res.status === 404) {
          title = "Não encontrado (404)";
          description = err?.message || "O módulo ou post não foi encontrado no banco de dados.";
        } else if (res.status === 503) {
          title = "Banco temporariamente indisponível";
          description = err?.message || "A conexão com o banco oscilou. Tente salvar novamente em instantes.";
        } else if (res.status === 500) {
          title = "Erro interno do servidor (500)";
          if (err?.details) {
            description = `${err.message || "Erro interno ao salvar post"}\n\nDetalhes técnicos: ${err.details}`;
          } else if (rawText && !rawText.trim().startsWith("<")) {
            description = `Erro no servidor: ${rawText}`;
          }
        }

        toast.error(title, {
          description,
          duration: 9000,
        });
        return;
      }

      toast.success(
        values.status === "SCHEDULED"
          ? (isEdit ? "Agendamento atualizado" : "Post agendado com sucesso")
          : (isEdit ? "Post atualizado" : "Post criado"),
        {
          description:
            values.status === "SCHEDULED"
              ? "O post será publicado automaticamente na data e hora definidas."
              : "Dados salvos com sucesso.",
        }
      );

      isSubmittedRef.current = true;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      try {
        localStorage.removeItem(storageKey);
        setLastSavedDraft(null);
      } catch {
        // Ignora
      }

      form.reset({
        moduleId,
        title: "",
        slug: "",
        concept: "",
        summary: "",
        image: "",
        isPublic: true,
        status: "DRAFT",
        scheduledFor: "",
        content: { html: "" },
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
    <section className="max-w-3xl mx-auto mb-24 md:mb-20">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-1">
            {isEdit ? "Editar Post" : "Criar Post"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {technologyName} / {moduleTitle}
          </p>
        </div>

        {lastSavedDraft && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-muted/60 border border-border/70 px-3 py-1.5 rounded-lg text-xs text-muted-foreground animate-in fade-in-0 duration-300">
            <i className="bx bx-check-circle text-emerald-500 text-base" />
            <span>Rascunho salvo ({lastSavedDraft})</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDiscardDraft}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Descartar rascunho salvo localmente"
            >
              Descartar
            </Button>
          </div>
        )}
      </div>

      {hasAnyError && (
        <div className="mb-4 text-sm text-rose-500">
          Existem campos inválidos. Clique em “Salvar Post” para ver o motivo.
        </div>
      )}

      <form id="post-form" onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">
        <Card className="p-4 sm:p-5 space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Módulo</Label>
            <Input type="number" value={moduleId} readOnly className="h-9 bg-muted cursor-not-allowed" />
            <input
              type="hidden"
              {...register("moduleId", { valueAsNumber: true })}
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
            <div className="flex gap-2 min-w-0">
              <Input
                placeholder="ex: variaveis-php"
                className="h-9 min-w-0 flex-1"
                {...register("slug")}
              />
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
            <Label className="text-xs font-medium">Resumo / Descrição (Opcional)</Label>
            <Textarea
              placeholder="Breve resumo ou descrição do post (opcional)."
              className="min-h-[70px] resize-y text-sm py-2"
              {...register("summary")}
            />
            {errors.summary?.message && (
              <p className="text-xs text-destructive">{errors.summary.message}</p>
            )}
          </div>

          {/* Imagem de Capa do Post */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
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
                    title={selectedCoverFile ? selectedCoverFile.name : (currentImage || undefined)}
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
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
                <div className="w-full sm:w-[200px] space-y-1">
                  <Label className="text-xs font-medium">Status do Post</Label>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      const nextStatus = v as CreatePostValues["status"];
                      field.onChange(nextStatus);
                      if (nextStatus === "SCHEDULED") {
                        const current = getValues("scheduledFor");
                        if (!current || !current.trim()) {
                          const bNow = getBrasiliaNow();
                          const tomorrow = new Date(bNow.dateObj);
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          const yyyy = tomorrow.getFullYear();
                          const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
                          const dd = String(tomorrow.getDate()).padStart(2, "0");
                          setValue("scheduledFor", `${yyyy}-${mm}-${dd}T12:00:00-03:00`, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }
                      } else {
                        setValue("scheduledFor", "", {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Rascunho</SelectItem>
                      <SelectItem value="PUBLISHED">Publicar agora</SelectItem>
                      <SelectItem value="SCHEDULED">Agendar publicação</SelectItem>
                      <SelectItem value="ARCHIVED">Arquivar</SelectItem>
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

          {/* Opção de Data e Horário com componentes Shadcn embaixo */}
          {watchedStatus === "SCHEDULED" && (
            <div className="pt-4 border-t border-border/60">
              <Controller
                control={control}
                name="scheduledFor"
                render={({ field }) => (
                  <PostSchedulePicker
                    value={field.value}
                    onChange={(iso) => {
                      field.onChange(iso);
                    }}
                    error={errors.scheduledFor?.message}
                  />
                )}
              />
            </div>
          )}
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

        {/* Botões padrão (Desktop) */}
        <div className="hidden md:flex items-center justify-between gap-3 pt-2">
          <Button type="button" variant="secondary" asChild>
            <Link
              href={`/admin/tecnologias/${technologySlug}/modulos/${moduleSlug}/posts`}
            >
              Cancelar
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !isValid || isUploadingImage}
            className="gap-2"
          >
            {isSubmitting || isUploadingImage ? (
              <>
                <i className="bx bx-loader-alt animate-spin text-base" />
                Salvando...
              </>
            ) : watchedStatus === "SCHEDULED" ? (
              <>
                <i className="bx bx-calendar-event text-base" />
                {isEdit ? "Atualizar Agendamento" : "Agendar Post"}
              </>
            ) : (
              <>
                <i className="bx bx-save text-base" />
                {isEdit ? "Atualizar Post" : "Salvar Post"}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Botões flutuantes (Somente Mobile) */}
      <div className="md:hidden fixed bottom-5 right-5 z-30 flex items-center gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          asChild
          className="h-12 w-12 rounded-full bg-card/95 backdrop-blur-md border-border shadow-lg"
          aria-label="Cancelar"
          title="Cancelar"
        >
          <Link
            href={`/admin/tecnologias/${technologySlug}/modulos/${moduleSlug}/posts`}
          >
            <i className="bx bx-x text-2xl" />
          </Link>
        </Button>

        <Button
          type="submit"
          form="post-form"
          disabled={isSubmitting || !isValid || isUploadingImage}
          className="h-12 px-5 rounded-full bg-blue-600 hover:bg-blue-600/90 text-white shadow-xl shadow-blue-600/30 gap-2"
          aria-label={
            watchedStatus === "SCHEDULED"
              ? isEdit
                ? "Atualizar Agendamento"
                : "Agendar Post"
              : isEdit
              ? "Atualizar Post"
              : "Salvar Post"
          }
        >
          {isSubmitting || isUploadingImage ? (
            <>
              <i className="bx bx-loader-alt animate-spin text-lg" />
              <span>Salvando...</span>
            </>
          ) : watchedStatus === "SCHEDULED" ? (
            <>
              <i className="bx bx-calendar-event text-lg" />
              <span>{isEdit ? "Atualizar" : "Agendar"}</span>
            </>
          ) : (
            <>
              <i className="bx bx-save text-lg" />
              <span>{isEdit ? "Atualizar" : "Salvar"}</span>
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
