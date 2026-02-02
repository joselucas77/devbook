"use client";

import { useEffect, useMemo } from "react";
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
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  FileText,
  Heading2,
  List,
  Code2,
  Sparkles,
  Save,
} from "lucide-react";

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

import { CreatePostSchema } from "@/zod/schemas/post-schema";
import { slugifySmart } from "@/lib/slugifySmart";
import { RichTextEditor } from "@/components/app/auth/admin/post/rich-text-editor";

type CreatePostValues = z.infer<typeof CreatePostSchema>;

export function PostForm({
  moduleId,
  technologyId,
  technologyName,
  moduleTitle,
  initialPost,
}: {
  moduleId: number;
  technologyId: number;
  technologyName: string;
  moduleTitle: string;
  initialPost: null | {
    id: number;
    title: string;
    slug: string;
    concept: string;
    summary: string;
    isPublic: boolean;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    content: { blocks: any[] };
  };
}) {
  const router = useRouter();
  const isEdit = !!initialPost?.id;

  const form = useForm<CreatePostValues>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: {
      moduleId,
      title: initialPost?.title ?? "",
      slug: initialPost?.slug ?? "",
      concept: initialPost?.concept ?? "",
      summary: initialPost?.summary ?? "",
      isPublic: initialPost?.isPublic ?? true,
      status: initialPost?.status ?? "DRAFT",
      content: initialPost?.content ?? {
        blocks: [{ type: "paragraph", text: "" }],
      },
    },
    // ✅ mais estável com fieldArray
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

  // ✅ Helpers: depois de mexer nos blocos, revalida "content"
  const revalidateContent = async () => {
    await trigger("content");
  };

  const addBlock = async (
    type: CreatePostValues["content"]["blocks"][number]["type"],
  ) => {
    switch (type) {
      case "paragraph":
        append({ type: "paragraph", text: "" }, { shouldFocus: false });
        break;
      case "heading":
        append({ type: "heading", level: 2, text: "" }, { shouldFocus: false });
        break;
      case "list":
        append(
          { type: "list", style: "bullet", items: [""] },
          { shouldFocus: false },
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
          { shouldFocus: false },
        );
        break;
      case "summary":
        append({ type: "summary", text: "" }, { shouldFocus: false });
        break;
    }

    // ✅ garante que isValid atualize
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
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? "Falha ao salvar post");
      }

      toast.success(isEdit ? "Post atualizado" : "Post criado", {
        description: "Dados salvos com sucesso.",
      });

      router.push(
        `/admin/tecnologias/${technologyId}/modulos/${moduleId}/posts`,
      );
      router.refresh();
    } catch (e: any) {
      toast.error("Erro ao salvar post", {
        description: e?.message ?? "Verifique o console e tente novamente.",
      });
      console.error(e);
    }
  };

  // ✅ quando o submit falhar por validação, você agora vai ver por quê
  const onInvalid = (errs: FieldErrors<CreatePostValues>) => {
    console.log("VALIDATION ERRORS:", errs);

    // tenta achar a primeira mensagem de erro “útil”
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

  // ✅ só para mostrar (debug visual opcional)
  const hasAnyError = useMemo(() => Object.keys(errors).length > 0, [errors]);

  return (
    <section className="max-w-3xl mx-auto mb-20">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-2">
            {isEdit ? "Editar Post" : "Criar Post"}
          </h1>
          <p className="text-sm text-gray-400">
            {technologyName} / {moduleTitle}
          </p>
        </div>

        {/* ✅ agora funciona sempre: se inválido, ele chama onInvalid e mostra toast */}
        <Button
          type="button"
          onClick={handleSubmit(onSubmit, onInvalid)}
          disabled={isSubmitting || !isValid}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Salvar
        </Button>
      </div>

      {hasAnyError && (
        <div className="mb-4 text-sm text-red-400">
          Existem campos inválidos. Clique em “Salvar” para ver o motivo.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <Card className="p-4 space-y-4">
          {/* ✅ ModuleId travado */}
          <div className="space-y-2">
            <Label>Módulo</Label>
            <Input type="number" value={moduleId} readOnly />
            <input
              type="hidden"
              {...register("moduleId", { valueAsNumber: true })}
              value={moduleId}
            />
            {errors.moduleId?.message && (
              <p className="text-sm text-red-500">{errors.moduleId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Título</Label>
            <Input placeholder="Ex: Variáveis em PHP" {...register("title")} />
            {errors.title?.message && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
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
                <Sparkles className="h-4 w-4" />
                Gerar
              </Button>
            </div>
            {errors.slug?.message && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Conceito</Label>
            <Textarea
              placeholder="Uma frase curta explicando o objetivo do post."
              className="min-h-22.5"
              {...register("concept")}
            />
            {errors.concept?.message && (
              <p className="text-sm text-red-500">{errors.concept.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Resumo</Label>
            <Textarea
              placeholder="Resumo para cards/listagens."
              className="min-h-22.5"
              {...register("summary")}
            />
            {errors.summary?.message && (
              <p className="text-sm text-red-500">{errors.summary.message}</p>
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
                <p className="text-xs text-gray-400">
                  Se desativado, só admin vê.
                </p>
              </div>
            </div>

            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <div className="w-55 space-y-2">
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
                    <p className="text-sm text-red-500">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </Card>

        {/* ✅ Barra sticky para adicionar blocos */}
        <div className="sticky top-0 z-40 -mx-4 px-4 py-3 bg-black/80 backdrop-blur border-b border-gray-800">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <h2 className="text-xl font-bold">Conteúdo</h2>

            <div className="flex flex-wrap gap-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => addBlock("heading")}
                className="gap-2"
              >
                <Heading2 className="h-4 w-4" /> Seção
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => addBlock("paragraph")}
                className="gap-2"
              >
                <FileText className="h-4 w-4" /> Parágrafo
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => addBlock("list")}
                className="gap-2"
              >
                <List className="h-4 w-4" /> Lista
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => addBlock("code")}
                className="gap-2"
              >
                <Code2 className="h-4 w-4" /> Código
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => addBlock("summary")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> Conclusão
              </Button>
            </div>
          </div>

          {errors.content?.blocks?.message && (
            <p className="max-w-3xl mx-auto mt-2 text-sm text-red-500">
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
              <Card key={field.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-gray-200">
                    Bloco {index + 1} —{" "}
                    <span className="text-gray-400">
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

                  <div className="flex items-center gap-2">
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
                    >
                      <ChevronUp className="h-4 w-4" />
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
                    >
                      <ChevronDown className="h-4 w-4" />
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
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
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
                              // valida
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
                        <p className="text-sm text-red-500">
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
                      name={`content.blocks.${index}.text`}
                      render={({ field }) => (
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Escreva o parágrafo..."
                        />
                      )}
                    />
                    {(errors.content?.blocks?.[index] as any)?.text
                      ?.message && (
                      <p className="text-sm text-red-500">
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
                      className="min-h-27.5"
                      placeholder="Feche o post com uma conclusão..."
                      {...register(`content.blocks.${index}.text` as const)}
                    />
                    {(errors.content?.blocks?.[index] as any)?.text
                      ?.message && (
                      <p className="text-sm text-red-500">
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
                              <p className="text-sm text-red-500">
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
                            `content.blocks.${index}.filename` as const,
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Código</Label>
                      <Textarea
                        className="min-h-45 font-mono"
                        placeholder="Cole o código aqui..."
                        {...register(`content.blocks.${index}.code` as const)}
                      />
                      {(errors.content?.blocks?.[index] as any)?.code
                        ?.message && (
                        <p className="text-sm text-red-500">
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
                        className="min-h-22.5"
                        placeholder="Explique o que esse código demonstra..."
                        {...register(
                          `content.blocks.${index}.explanation` as const,
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
              href={`/admin/tecnologias/${technologyId}/modulos/${moduleId}/posts`}
            >
              Cancelar
            </Link>
          </Button>

          {/* ✅ submit real do form */}
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
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
                  <SelectItem value="bullet">Bullet</SelectItem>
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
            <Plus className="h-4 w-4" />
            Adicionar item
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {itemsArray.fields.map((f, i) => (
          <div key={f.id} className="flex items-start gap-2">
            <div className="w-full space-y-2">
              <Label className="text-xs text-gray-400">Item {i + 1}</Label>
              <Input
                placeholder="Digite um item..."
                {...register(`content.blocks.${index}.items.${i}`)}
              />
              {(errors.content?.blocks?.[index] as any)?.items?.[i]
                ?.message && (
                <p className="text-sm text-red-500">
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
              className="mt-6"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
