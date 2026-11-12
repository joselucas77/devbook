"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  useForm,
  useFieldArray,
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
import { RichTextEditor } from "@/components/posts/rich-text-editor";
import { EMPTY_RICH_TEXT_DOC, RichTextDoc } from "@/types/post";

type CreatePostValues = z.infer<typeof CreatePostSchema>;

export function PostForm({
  moduleId,
  technologyId,
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
    content: { blocks: any[] };
  };
}) {
  const router = useRouter();
  const isEdit = !!initialPost?.id;
  const [imageMode, setImageMode] = useState<"file" | "url">(
    initialPost?.image ? "url" : "file"
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
      content: initialPost?.content ?? {
        blocks: [
          {
            type: "paragraph",
            content: EMPTY_RICH_TEXT_DOC,
          },
        ],
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

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "content.blocks",
  });

  const revalidateContent = async () => {
    await trigger("content");
  };

  const currentImage = watch("image");

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Falha no upload");
      }

      const data = await res.json();
      setValue("image", data.url, { shouldValidate: true, shouldDirty: true });
      toast.success("Imagem enviada com sucesso para o Neon Storage!");
    } catch (err: any) {
      toast.error("Erro no upload", { description: err?.message });
    } finally {
      setIsUploadingImage(false);
    }
  }

  const addBlock = async (
    type: CreatePostValues["content"]["blocks"][number]["type"]
  ) => {
    switch (type) {
      case "paragraph":
        append(
          {
            type: "paragraph",
            content: EMPTY_RICH_TEXT_DOC,
          },
          { shouldFocus: false }
        );
        break;
      case "heading":
        append({ type: "heading", level: 2, text: "" }, { shouldFocus: false });
        break;
      case "list":
        append(
          { type: "list", style: "bullet", items: [""] },
          { shouldFocus: false }
        );
        break;
      case "code":
        append(
          {
            type: "code",
            language: "php",
            filename: "index.php",
            code: "",
            explanation: "",
          },
          { shouldFocus: false }
        );
        break;
      case "summary":
        append({ type: "summary", text: "" }, { shouldFocus: false });
        break;
    }

    await revalidateContent();
  };

  const onSubmit = async (values: CreatePostValues) => {
    try {
      const res = await fetch(
        isEdit ? `/api/admin/posts/${initialPost!.id}` : "/api/admin/posts",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? "Falha ao salvar post");
      }

      toast.success(isEdit ? "Post atualizado" : "Post criado", {
        description: "Dados salvos com sucesso.",
      });

      router.push(
        `/admin/tecnologias/${technologySlug}/modulos/${moduleSlug}/posts`
      );
      router.refresh();
    } catch (e: any) {
      toast.error("Erro ao salvar post", {
        description: e?.message ?? "Verifique os dados e tente novamente.",
      });
      console.error(e);
    }
  };

  const onInvalid = (errs: FieldErrors<CreatePostValues>) => {
    const first =
      errs.title?.message ||
      errs.slug?.message ||
      errs.concept?.message ||
      errs.summary?.message ||
      errs.moduleId?.message ||
      (errs.content as any)?.blocks?.message ||
      "Verifique os campos destacados.";

    toast.error("Formulário inválido", { description: String(first) });
  };

  const hasAnyError = useMemo(() => Object.keys(errors).length > 0, [errors]);

  return (
    <section className="max-w-3xl mx-auto mb-20">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
            {isEdit ? "Editar Post" : "Criar Post"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {technologyName} / {moduleTitle}
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSubmit(onSubmit, onInvalid)}
          disabled={isSubmitting || !isValid}
          className="gap-2"
        >
          <i className="bx bx-save text-base" />
          Salvar
        </Button>
      </div>

      {hasAnyError && (
        <div className="mb-4 text-sm text-rose-500">
          Existem campos inválidos. Clique em “Salvar” para ver o motivo.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Módulo</Label>
            <Input type="number" value={moduleId} readOnly className="bg-muted cursor-not-allowed" />
            <input
              type="hidden"
              {...register("moduleId", { valueAsNumber: true })}
              value={moduleId}
            />
            {errors.moduleId?.message && (
              <p className="text-sm text-destructive">{errors.moduleId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Título</Label>
            <Input placeholder="Ex: Variáveis em PHP" {...register("title")} />
            {errors.title?.message && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <div className="flex gap-2">
              <Input placeholder="ex: variaveis-php" {...register("slug")} />
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setValue("slug", slugifySmart(getValues("title")), {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  })
                }
                className="gap-2"
              >
                <i className="bx bx-sparkles text-base" />
                Gerar
              </Button>
            </div>
            {errors.slug?.message && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Conceito</Label>
            <Textarea
              placeholder="Uma frase curta explicando o objetivo do post."
              className="min-h-[90px]"
              {...register("concept")}
            />
            {errors.concept?.message && (
              <p className="text-sm text-destructive">{errors.concept.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Resumo</Label>
            <Textarea
              placeholder="Resumo para cards/listagens."
              className="min-h-[90px]"
              {...register("summary")}
            />
            {errors.summary?.message && (
              <p className="text-sm text-destructive">{errors.summary.message}</p>
            )}
          </div>

          {/* Imagem de Capa do Post */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Imagem de Capa (Opcional)</Label>
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
                  type="file"
                  accept="image/*"
                  disabled={isUploadingImage}
                  onChange={handleImageUpload}
                  className="cursor-pointer file:cursor-pointer"
                />
                <p className="text-[11px] text-muted-foreground">
                  Selecione um arquivo de imagem. O upload para o Neon Storage é automático.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <Input
                  placeholder="https://exemplo.com/banner.png"
                  {...register("image")}
                />
                <p className="text-[11px] text-muted-foreground">
                  Cole uma URL pública de imagem.
                </p>
              </div>
            )}

            {isUploadingImage && (
              <div className="flex items-center gap-2 text-xs text-blue-500 py-1">
                <i className="bx bx-loader-alt animate-spin text-base" />
                Enviando imagem para o Neon Object Storage...
              </div>
            )}

            {currentImage && (
              <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-muted/30">
                <img
                  src={currentImage}
                  alt="Prévia"
                  className="h-12 w-20 rounded-md object-cover border border-border bg-background shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{currentImage}</p>
                  <p className="text-[10px] text-emerald-500 flex items-center gap-1">
                    <i className="bx bx-check-circle text-xs" /> Imagem vinculada
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 shrink-0"
                  onClick={() =>
                    setValue("image", "", {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
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
                <div className="w-[180px] space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={field.value}
                    onValueChange={(v) =>
                      field.onChange(v as CreatePostValues["status"])
                    }
                  >
                    <SelectTrigger>
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

        {/* Sticky bar for adding blocks */}
        <div className="sticky top-14 z-40 -mx-4 px-4 py-3 bg-background/80 backdrop-blur border-y border-border">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Conteúdo</h2>

            <div className="flex flex-wrap gap-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => addBlock("heading")}
                className="gap-1.5"
              >
                <i className="bx bx-heading text-base" /> Seção
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => addBlock("paragraph")}
                className="gap-1.5"
              >
                <i className="bx bx-paragraph text-base" /> Parágrafo
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => addBlock("list")}
                className="gap-1.5"
              >
                <i className="bx bx-list-ul text-base" /> Lista
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => addBlock("code")}
                className="gap-1.5"
              >
                <i className="bx bx-code-alt text-base" /> Código
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => addBlock("summary")}
                className="gap-1.5"
              >
                <i className="bx bx-check-shield text-base" /> Conclusão
              </Button>
            </div>
          </div>

          {errors.content?.blocks?.message && (
            <p className="max-w-3xl mx-auto mt-2 text-sm text-destructive">
              {errors.content.blocks.message as any}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => {
            const type = (field as any).type as
              | "heading"
              | "paragraph"
              | "list"
              | "code"
              | "summary";

            return (
              <Card key={field.id} className="p-4 border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-foreground">
                    Bloco {index + 1} —{" "}
                    <span className="text-muted-foreground">
                      {type === "heading"
                        ? "Título"
                        : type === "paragraph"
                        ? "Parágrafo"
                        : type === "list"
                        ? "Lista"
                        : type === "code"
                        ? "Código"
                        : type === "summary"
                        ? "Conclusão"
                        : type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        if (index === 0) return;
                        move(index, index - 1);
                        await revalidateContent();
                      }}
                      disabled={index === 0}
                      title="Mover para cima"
                      className="h-8 w-8"
                    >
                      <i className="bx bx-chevron-up text-lg" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        if (index === fields.length - 1) return;
                        move(index, index + 1);
                        await revalidateContent();
                      }}
                      disabled={index === fields.length - 1}
                      title="Mover para baixo"
                      className="h-8 w-8"
                    >
                      <i className="bx bx-chevron-down text-lg" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        remove(index);
                        await revalidateContent();
                      }}
                      title="Remover bloco"
                      className="h-8 w-8 text-rose-500 hover:text-rose-600"
                    >
                      <i className="bx bx-trash text-lg" />
                    </Button>
                  </div>
                </div>

                {type === "heading" && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Controller
                      control={control}
                      name={`content.blocks.${index}.level` as const}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label>Nível</Label>
                          <Select
                            value={String(field.value ?? 2)}
                            onValueChange={(v) => {
                              field.onChange(Number(v));
                              trigger(`content.blocks.${index}` as any);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">H2</SelectItem>
                              <SelectItem value="3">H3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    />

                    <div className="md:col-span-3 space-y-2">
                      <Label>Título da seção</Label>
                      <Input
                        placeholder="Ex: Regras básicas"
                        {...register(`content.blocks.${index}.text` as const)}
                      />
                      {(errors.content?.blocks?.[index] as any)?.text
                        ?.message && (
                        <p className="text-sm text-destructive">
                          {
                            (errors.content?.blocks?.[index] as any)?.text
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {type === "paragraph" && (
                  <div className="space-y-2">
                    <Label>Parágrafo</Label>
                    <Controller
                      control={control}
                      name={`content.blocks.${index}.content`}
                      render={({ field }) => (
                        <RichTextEditor
                          value={field.value as RichTextDoc}
                          onChange={field.onChange}
                          placeholder="Escreva o parágrafo..."
                        />
                      )}
                    />
                    {(errors.content?.blocks?.[index] as any)?.text
                      ?.message && (
                      <p className="text-sm text-destructive">
                        {
                          (errors.content?.blocks?.[index] as any)?.text
                            ?.message
                        }
                      </p>
                    )}
                  </div>
                )}

                {type === "summary" && (
                  <div className="space-y-2">
                    <Label>Conclusão / Resumo final</Label>
                    <Textarea
                      className="min-h-[110px]"
                      placeholder="Feche o post com uma conclusão..."
                      {...register(`content.blocks.${index}.text` as const)}
                    />
                    {(errors.content?.blocks?.[index] as any)?.text
                      ?.message && (
                      <p className="text-sm text-destructive">
                        {
                          (errors.content?.blocks?.[index] as any)?.text
                            ?.message
                        }
                      </p>
                    )}
                  </div>
                )}

                {type === "list" && (
                  <ListBlockEditor
                    control={control}
                    register={register}
                    errors={errors}
                    index={index}
                    onRevalidate={revalidateContent}
                  />
                )}

                {type === "code" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Controller
                        control={control}
                        name={`content.blocks.${index}.language` as const}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <Label>Linguagem</Label>
                            <Select
                              value={field.value ?? "php"}
                              onValueChange={(v) => {
                                field.onChange(v);
                                trigger(`content.blocks.${index}` as any);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="php">php</SelectItem>
                                <SelectItem value="js">js</SelectItem>
                                <SelectItem value="ts">ts</SelectItem>
                                <SelectItem value="html">html</SelectItem>
                                <SelectItem value="css">css</SelectItem>
                                <SelectItem value="bash">bash</SelectItem>
                                <SelectItem value="sql">sql</SelectItem>
                                <SelectItem value="txt">txt</SelectItem>
                              </SelectContent>
                            </Select>
                            {(errors.content?.blocks?.[index] as any)?.language
                              ?.message && (
                              <p className="text-sm text-destructive">
                                {
                                  (errors.content?.blocks?.[index] as any)
                                    ?.language?.message
                                }
                              </p>
                            )}
                          </div>
                        )}
                      />

                      <div className="md:col-span-2 space-y-2">
                        <Label>Nome do arquivo (opcional)</Label>
                        <Input
                          placeholder="Ex: index.php"
                          {...register(
                            `content.blocks.${index}.filename` as const
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Código</Label>
                      <Textarea
                        className="min-h-[180px] font-mono text-xs"
                        placeholder="Cole o código aqui..."
                        {...register(`content.blocks.${index}.code` as const)}
                      />
                      {(errors.content?.blocks?.[index] as any)?.code
                        ?.message && (
                        <p className="text-sm text-destructive">
                          {
                            (errors.content?.blocks?.[index] as any)?.code
                              ?.message
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Explicação (opcional)</Label>
                      <Textarea
                        className="min-h-[90px]"
                        placeholder="Explique o que esse código demonstra..."
                        {...register(
                          `content.blocks.${index}.explanation` as const
                        )}
                      />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
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

function ListBlockEditor({
  control,
  register,
  errors,
  index,
  onRevalidate,
}: {
  control: any;
  register: any;
  errors: any;
  index: number;
  onRevalidate: () => Promise<void>;
}) {
  const itemsArray = useFieldArray({
    control,
    name: `content.blocks.${index}.items`,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Controller
          control={control}
          name={`content.blocks.${index}.style`}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>Estilo</Label>
              <Select
                value={field.value ?? "bullet"}
                onValueChange={async (v) => {
                  field.onChange(v);
                  await onRevalidate();
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bullet">Marcadores (Bullet)</SelectItem>
                  <SelectItem value="numbered">Numerada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <div className="md:col-span-2 flex items-end justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              itemsArray.append("");
              await onRevalidate();
            }}
            className="gap-2"
          >
            <i className="bx bx-plus text-base" />
            Adicionar item
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {itemsArray.fields.map((f, i) => (
          <div key={f.id} className="flex items-start gap-2">
            <div className="w-full space-y-2">
              <Label className="text-xs text-muted-foreground">Item {i + 1}</Label>
              <Input
                placeholder="Digite um item..."
                {...register(`content.blocks.${index}.items.${i}`)}
              />
              {(errors.content?.blocks?.[index] as any)?.items?.[i]
                ?.message && (
                <p className="text-sm text-destructive">
                  {
                    (errors.content?.blocks?.[index] as any)?.items?.[i]
                      ?.message
                  }
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={async () => {
                itemsArray.remove(i);
                await onRevalidate();
              }}
              title="Remover item"
              className="mt-6 text-rose-500 hover:text-rose-600 h-9 w-9"
            >
              <i className="bx bx-trash text-base" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
