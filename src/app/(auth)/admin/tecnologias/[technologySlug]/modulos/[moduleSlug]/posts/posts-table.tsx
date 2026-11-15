"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

type Row = {
  id: number;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isPublic: boolean;
  order: number;
  createdAt: string;
};

async function deletePost(id: number) {
  const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Falha ao deletar post");
}

export function PostsTable({
  technologyId,
  technologySlug,
  moduleId,
  moduleSlug,
  data,
}: {
  technologyId: number;
  technologySlug: string;
  moduleSlug: string;
  moduleId: number;
  data: Row[];
}) {
  const router = useRouter();

  const [items, setItems] = React.useState<Row[]>(data);
  const [isReordering, setIsReordering] = React.useState(false);

  React.useEffect(() => {
    setItems(data);
  }, [data]);

  async function handleReorder(newItems: Row[]) {
    const previous = items;
    setItems(newItems);
    setIsReordering(true);

    try {
      const res = await fetch("/api/admin/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "posts",
          orderedIds: newItems.map((item) => item.id),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? "Falha ao reordenar posts");
      }

      toast.success("Ordem dos posts atualizada com sucesso!");
      router.refresh();
    } catch (e: any) {
      setItems(previous);
      toast.error("Erro ao reordenar", { description: e?.message });
    } finally {
      setIsReordering(false);
    }
  }

  function moveItem(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) return;
    const updated = [...items];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    handleReorder(updated);
  }

  const columns: ColumnDef<Row>[] = React.useMemo(
    () => [
      {
        accessorKey: "order",
        header: "Ordem",
        cell: ({ row }) => {
          const index = items.findIndex((it) => it.id === row.original.id);
          const isFirst = index <= 0;
          const isLast = index === items.length - 1;

          return (
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className="font-mono text-xs px-1.5 py-0 min-w-[2rem] justify-center bg-muted/40"
              >
                #{index + 1}
              </Badge>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-20"
                  disabled={isFirst || isReordering}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveItem(index, index - 1);
                  }}
                  title="Mover para cima"
                >
                  <i className="bx bx-chevron-up text-lg" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-20"
                  disabled={isLast || isReordering}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveItem(index, index + 1);
                  }}
                  title="Mover para baixo"
                >
                  <i className="bx bx-chevron-down text-lg" />
                </Button>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0 gap-1 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Título <i className="bx bx-sort text-sm ml-1" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">
            <div className="text-foreground">{row.original.title}</div>
            <div className="text-xs text-muted-foreground">{row.original.slug}</div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              variant={
                status === "PUBLISHED"
                  ? "default"
                  : status === "DRAFT"
                  ? "secondary"
                  : "outline"
              }
              className="text-xs"
            >
              {status === "DRAFT"
                ? "Rascunho"
                : status === "PUBLISHED"
                ? "Publicado"
                : "Arquivado"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "isPublic",
        header: "Público",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.isPublic ? "Sim" : "Não"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const p = row.original;
          const index = items.findIndex((it) => it.id === p.id);
          const isFirst = index <= 0;
          const isLast = index === items.length - 1;

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <i className="bx bx-dots-horizontal-rounded text-lg" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/tecnologias/${technologySlug}/modulos/${moduleSlug}/post/${p.slug}`}
                      target="_blank"
                      className="gap-2 cursor-pointer"
                    >
                      <i className="bx bx-globe text-base mr-1" />
                      Ver no site
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href={`/admin/tecnologias/${technologySlug}/modulos/${moduleSlug}/posts/novo?edit=${p.id}&moduleId=${moduleId}`}
                      className="gap-2 cursor-pointer"
                    >
                      <i className="bx bx-pencil text-base mr-1" />
                      Editar
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    disabled={isFirst || isReordering}
                    onSelect={() => moveItem(index, 0)}
                    className="gap-2 cursor-pointer"
                  >
                    <i className="bx bx-arrow-to-top text-base mr-1.5" />
                    Mover para o topo
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    disabled={isLast || isReordering}
                    onSelect={() => moveItem(index, items.length - 1)}
                    className="gap-2 cursor-pointer"
                  >
                    <i className="bx bx-arrow-to-bottom text-base mr-1.5" />
                    Mover para o final
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="gap-2 text-rose-500 focus:text-rose-500 cursor-pointer"
                    onClick={async () => {
                      try {
                        await deletePost(p.id);
                        toast.success("Post deletado com sucesso");
                        router.refresh();
                      } catch (err: any) {
                        toast.error("Erro ao deletar post", {
                          description: err?.message,
                        });
                      }
                    }}
                  >
                    <i className="bx bx-trash text-base mr-1 text-rose-500" />
                    Deletar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [items, isReordering, technologySlug, moduleSlug, moduleId, router]
  );

  return (
    <DataTable
      columns={columns}
      data={items}
      technologyId={technologyId}
      technologySlug={technologySlug}
      moduleId={moduleId}
      moduleSlug={moduleSlug}
      searchColumnId="title"
      searchPlaceholder="Pesquisar por título..."
    />
  );
}
