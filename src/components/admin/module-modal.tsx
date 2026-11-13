"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect } from "react";

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

import { slugifySmart } from "@/lib/slugify";
import {
  CreateModuleSchema,
  type CreateModuleValues,
} from "@/lib/validations/module";

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

  const form = useForm<CreateModuleValues>({
    resolver: zodResolver(CreateModuleSchema),
    defaultValues: {
      technologyId,
      title: initial?.title ?? "",
      slug: initial?.slug ?? "",
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
      technologyId,
      title: initial?.title ?? "",
      slug: initial?.slug ?? "",
    });
  }, [open, initial, technologyId, reset]);

  async function onSubmit(values: CreateModuleValues) {
    try {
      const res = await fetch(
        isEdit ? `/api/admin/modules/${initial!.id}` : "/api/admin/modules",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? "Falha ao salvar módulo");
      }

      toast.success(isEdit ? "Módulo atualizado" : "Módulo criado");
      onOpenChange(false);
      onSaved?.();
    } catch (e: unknown) {
      toast.error("Erro ao salvar módulo", {
        description: e instanceof Error ? e.message : "Erro inesperado",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md z-200 w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEdit ? "Editar Módulo" : "Novo Módulo"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tecnologia: <span className="font-semibold text-foreground">{technologyName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full min-w-0 max-w-full">
          <div className="space-y-2 min-w-0">
            <Label>Título</Label>
            <Input placeholder="Ex: Começando com PHP" {...register("title")} />
            {errors.title?.message && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2 min-w-0">
            <Label>Slug</Label>
            <div className="flex gap-2 min-w-0 w-full">
              <Input
                placeholder="ex: comecando-com-php"
                className="min-w-0 flex-1"
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

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="gap-2 bg-blue-600 hover:bg-blue-600/90 text-white"
            >
              <i className="bx bx-save text-base" />
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
