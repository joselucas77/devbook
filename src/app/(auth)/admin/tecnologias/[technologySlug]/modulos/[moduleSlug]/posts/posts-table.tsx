"use client";

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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

type Row = {
  id: number;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isPublic: boolean;
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

  const columns: ColumnDef<Row>[] = [
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
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <i className="bx bx-dots-horizontal-rounded text-lg" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-44">
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
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      technologyId={technologyId}
      technologySlug={technologySlug}
      moduleId={moduleId}
      moduleSlug={moduleSlug}
      searchColumnId="title"
      searchPlaceholder="Pesquisar por título..."
    />
  );
}
