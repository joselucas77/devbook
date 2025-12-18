"use client";

import { useEffect } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
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

type CreatePostValues = z.infer<typeof CreatePostSchema>;

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function Page() {
  const form = useForm<CreatePostValues>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: {
      categoryId: 1,
      moduleId: 1,
      title: "",
      slug: "",
      concept: "",
      summary: "",
      isPublic: true,
      status: "DRAFT",
      content: { blocks: [{ type: "paragraph", text: "" }] },
    },
    mode: "onChange",
  });

  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = form;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "content.blocks",
  });

  const title = watch("title");
  const slug = watch("slug");

  useEffect(() => {
    if (!title) return;
    if (slug?.length) return;
    setValue("slug", slugifySmart(getValues("title")), {
      shouldValidate: true,
    });
    // setValue("slug", slugify(title), { shouldValidate: true });
  }, [title, slug, setValue]);

  const addBlock = (
    type: CreatePostValues["content"]["blocks"][number]["type"]
  ) => {
    switch (type) {
      case "paragraph":
        append({ type: "paragraph", text: "" });
        break;
      case "heading":
        append({ type: "heading", level: 2, text: "" });
        break;
      case "list":
        append({ type: "list", style: "bullet", items: [""] });
        break;
      case "code":
        append({
          type: "code",
          language: "php",
          filename: "index.php",
          code: "",
          explanation: "",
        });
        break;
      case "summary":
        append({ type: "summary", text: "" });
        break;
    }
  };

  const onSubmit = async (values: CreatePostValues) => {
    try {
      // 🔥 Aqui você vai trocar por fetch pra sua API:
      // await fetch("/api/admin/posts", { method: "POST", body: JSON.stringify(values) })
      console.log("PAYLOAD CREATE POST:", values);

      toast.success("Post criado (mock)", {
        description: "Payload validado e pronto para enviar ao backend.",
      });

      // opcional: voltar ou ir para listagem
      // router.push("/admin/posts");
    } catch (e) {
      toast.error("Erro ao criar post", {
        description: "Verifique o console e tente novamente.",
      });
      console.error(e);
    }
  };

  return (
    <section className="max-w-3xl mx-auto mb-20">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-2">
            Criar Post
          </h1>
          <p className="text-sm text-gray-400">
            Preencha os campos e monte o conteúdo por blocos (sem Markdown).
          </p>
        </div>

        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || !isValid}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Salvar
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category ID</Label>
              <Input
                type="number"
                {...register("categoryId", { valueAsNumber: true })}
              />
              {errors.categoryId?.message && (
                <p className="text-sm text-red-500">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Module ID</Label>
              <Input
                type="number"
                {...register("moduleId", { valueAsNumber: true })}
              />
              {errors.moduleId?.message && (
                <p className="text-sm text-red-500">
                  {errors.moduleId.message}
                </p>
              )}
            </div>
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
              <Input placeholder="ex: variaveis-em-php" {...register("slug")} />
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setValue("slug", slugify(getValues("title")), {
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
            <Label>Conceito</Label>
            <Textarea
              placeholder="Uma frase curta explicando o objetivo do post."
              className="min-h-[90px]"
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
              className="min-h-[90px]"
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
                  setValue("isPublic", v, { shouldValidate: true })
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
                <div className="w-[220px] space-y-2">
                  <Label>Status</Label>
                  <Select value={field.value} onValueChange={field.onChange}>
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

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Conteúdo</h2>

          <div className="flex flex-wrap gap-2">
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
          <p className="text-sm text-red-500">
            {errors.content.blocks.message}
          </p>
        )}

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
                    <span className="text-gray-400">{type}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => index > 0 && move(index, index - 1)}
                      disabled={index === 0}
                      title="Mover para cima"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        index < fields.length - 1 && move(index, index + 1)
                      }
                      disabled={index === fields.length - 1}
                      title="Mover para baixo"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
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
                            onValueChange={(v) => field.onChange(Number(v))}
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
                    <Textarea
                      className="min-h-[110px]"
                      placeholder="Escreva o texto do parágrafo..."
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
                              onValueChange={field.onChange}
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
                            `content.blocks.${index}.filename` as const
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Código</Label>
                      <Textarea
                        className="min-h-[180px] font-mono"
                        placeholder={`Cole o código aqui...`}
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
            <Link href="/admin/posts">Cancelar</Link>
          </Button>

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
}: {
  control: any;
  register: any;
  errors: any;
  index: number;
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
                onValueChange={field.onChange}
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
            onClick={() => itemsArray.append("")}
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
              onClick={() => itemsArray.remove(i)}
              title="Remover item"
              className="mt-6"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}

        {(errors.content?.blocks?.[index] as any)?.items?.message && (
          <p className="text-sm text-red-500">
            {(errors.content?.blocks?.[index] as any)?.items?.message}
          </p>
        )}
      </div>
    </div>
  );
}
