"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const ModuleSchema = z.object({
  title: z.string().min(2, "Título obrigatório"),
  slug: z
    .string()
    .min(2, "Slug obrigatório")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido"),
});

type ModuleFormValues = z.infer<typeof ModuleSchema>;

export type ModuleRow = {
  id: number;
  title: string;
  slug: string;
  technologyId: number;
};

export function ModuleModal({
  open,
  onOpenChange,
  technologyId,
  technologyName,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  technologyId: number;
  technologyName: string;
  initial?: ModuleRow | null;
  onSaved?: () => void;
}) {
  const isEdit = !!initial?.id;

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(ModuleSchema),
    defaultValues: {
      title: initial?.title ?? "",
      slug: initial?.slug ?? "",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = form;

  const title = watch("title");
  const slug = watch("slug");

  React.useEffect(() => {
    if (!open) return;
    reset({ title: initial?.title ?? "", slug: initial?.slug ?? "" });
  }, [open, initial, reset]);

  React.useEffect(() => {
    if (!open) return;
    if (!title) return;
    if (slug?.length) return;
    setValue("slug", slugifySmart(getValues("title")), {
      shouldValidate: true,
    });
  }, [open, title, slug, setValue, getValues]);

  async function onSubmit(values: ModuleFormValues) {
    try {
      const payload = isEdit ? values : { ...values, technologyId };

      const res = await fetch(
        isEdit ? `/api/admin/modules/${initial!.id}` : "/api/admin/modules",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? "Falha ao salvar módulo");
      }

      toast.success(isEdit ? "Módulo atualizado" : "Módulo criado");
      onOpenChange(false);
      onSaved?.();
    } catch (e: any) {
      toast.error("Erro ao salvar módulo", { description: e?.message });
      console.error(e);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-140">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEdit ? "Editar Módulo" : "Novo Módulo"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {technologyName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              placeholder="Ex: Conceitos primários"
              {...register("title")}
            />
            {errors.title?.message && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <div className="flex gap-2">
              <Input
                placeholder="ex: conceitos-primarios"
                {...register("slug")}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setValue("slug", slugifySmart(getValues("title")), {
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
