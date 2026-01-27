"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/app/auth/admin/data-table/data-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Row = {
  id: number;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isPublic: boolean;
  createdAt: Date;
};

async function deletePost(id: number) {
  const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Falha ao deletar");
}

export function PostsTable({
  technologyId,
  tecnologySlug,
  moduleId,
  moduleSlug,
  data,
}: {
  technologyId: number;
  tecnologySlug: string;
  moduleSlug: string;
  moduleId: number;
  data: Row[];
}) {
  const columns: ColumnDef<Row>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Título <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.title}
          <div className="text-xs text-zinc-400">{row.original.slug}</div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span className="text-sm text-zinc-200">
            {row.original.status === "DRAFT"
              ? "Rascunho"
              : row.original.status === "PUBLISHED"
                ? "Publicado"
                : "Arquivado"}
          </span>
        );
      },
    },
    {
      accessorKey: "isPublic",
      header: "Público",
      cell: ({ row }) => (
        <span className="text-sm text-zinc-200">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                {/* Ajuste para sua rota pública do post, se tiver */}
                <Link
                  href={`/tecnologias/${tecnologySlug}/modulos/${moduleSlug}/post/${p.slug}`}
                >
                  Ver no site
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href={`/admin/tecnologias/${technologyId}/modulos/${moduleId}/posts/novo?edit=${p.id}`}
                >
                  Editar
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-red-500"
                onClick={async () => {
                  try {
                    await deletePost(p.id);
                    toast.success("Post deletado");
                    window.location.reload();
                  } catch {
                    toast.error("Erro ao deletar");
                  }
                }}
              >
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      technologyId={technologyId}
      moduleId={moduleId}
      searchColumnId="title"
      searchPlaceholder="Pesquisar post..."
    />
  );
}
