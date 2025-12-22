"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  useReactTable,
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  Plus,
  Settings2,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  TechnologyModal,
  TechnologyRow,
} from "@/components/app/auth/admin/tecnology/technology-modal";
import { useMemo, useState } from "react";
import { formatDateBR } from "@/lib/formatDate";

type Row = {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  image: string | null;
  modulesCount: number;
  createdAt: string;
  updatedAt: string;
};

export function TechnologiesTable({ data }: { data: Row[] }) {
  const router = useRouter();

  // modal
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<TechnologyRow | null>(null);

  // delete confirm
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(row: Row) {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/technologies/${row.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? "Falha ao deletar tecnologia");
      }

      toast.success("Tecnologia deletada");
      setDeleting(null);
      router.refresh();
    } catch (e: any) {
      toast.error("Erro ao deletar", { description: e?.message });
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 gap-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nome <ArrowUpDown className="h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <div className="font-medium text-zinc-100">{row.original.name}</div>
            <div className="text-xs text-gray-400">{row.original.slug}</div>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Categoria",
        cell: ({ row }) => (
          <span className="text-sm text-zinc-200">{row.original.category}</span>
        ),
      },
      {
        accessorKey: "modulesCount",
        header: "Módulos",
        cell: ({ row }) => (
          <span className="text-sm text-zinc-200">
            {row.original.modulesCount}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Atualizado",
        cell: ({ row }) => {
          // const d = new Date(row.original.updatedAt);
          return (
            <span className="text-sm text-gray-300">
              {formatDateBR(row.original.updatedAt)}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const t = row.original;

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>

                  <DropdownMenuItem asChild>
                    <Link
                      href={`/admin/tecnologias/${t.id}/modulos`}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Acessar módulos
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="gap-2"
                    onSelect={() => {
                      setEditing({
                        id: t.id,
                        name: t.name,
                        slug: t.slug,
                        category: t.category,
                        description: t.description,
                        image: t.image,
                      });
                      setOpenModal(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="gap-2 text-red-500 focus:text-red-500"
                    onSelect={() => setDeleting(t)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Deletar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    []
  );

  // table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar por nome..."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="w-full md:w-[320px]"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "modulesCount"
                        ? "módulos"
                        : column.id === "updatedAt"
                        ? "atualizado"
                        : column.id === "category"
                        ? "categoria"
                        : column.id === "name"
                        ? "nome"
                        : column.id === "actions"
                        ? "ações"
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            className="gap-2"
            onClick={() => {
              setEditing(null);
              setOpenModal(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nova Tecnologia
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border border-zinc-800">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-zinc-800">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-zinc-200">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-zinc-800">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="align-top">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-zinc-800">
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-400"
                  >
                    Nenhuma tecnologia encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-3 mt-4">
          <div className="text-sm text-gray-400">
            {table.getFilteredRowModel().rows.length} resultado(s)
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Próxima
            </Button>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <TechnologyModal
        open={openModal}
        onOpenChange={setOpenModal}
        initial={editing}
        onSaved={() => router.refresh()}
      />

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar tecnologia?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso vai remover a tecnologia{" "}
              <span className="font-medium text-zinc-200">
                {deleting?.name}
              </span>{" "}
              e pode impactar os módulos/posts vinculados (dependendo do seu
              onDelete no Prisma).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting || !deleting}
              onClick={() => deleting && handleDelete(deleting)}
              className="bg-red-600 hover:bg-red-600/90"
            >
              {isDeleting ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
