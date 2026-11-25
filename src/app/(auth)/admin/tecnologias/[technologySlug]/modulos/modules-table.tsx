"use client";

import * as React from "react";
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
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ModuleModal,
  type ModuleRow,
} from "@/components/admin/module-modal";
import { formatDateBR } from "@/lib/format-date";
import { Badge } from "@/components/ui/badge";

type Row = {
  id: number;
  title: string;
  slug: string;
  order: number;
  technologyId: number;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
};

export function ModulesTable({
  technologyId,
  technologyName,
  technologySlug,
  data,
}: {
  technologyId: number;
  technologyName: string;
  technologySlug: string;
  data: Row[];
}) {
  const router = useRouter();

  // local items state for optimistic reordering
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
          type: "modules",
          orderedIds: newItems.map((item) => item.id),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? "Falha ao reordenar módulos");
      }

      toast.success("Ordem dos módulos atualizada com sucesso!");
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

  // modal
  const [openModal, setOpenModal] = React.useState(false);
  const [editing, setEditing] = React.useState<ModuleRow | null>(null);

  // delete confirm
  const [deleting, setDeleting] = React.useState<Row | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function handleDelete(row: Row) {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/modules/${row.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? "Falha ao deletar módulo");
      }

      toast.success("Módulo deletado");
      setDeleting(null);
      router.refresh();
    } catch (e: any) {
      toast.error("Erro ao deletar", { description: e?.message });
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = React.useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: "order",
        header: "Ordem",
        meta: { className: "hidden md:table-cell" },
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
            className="-ml-3 gap-1 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Título <i className="bx bx-sort text-sm ml-1" />
          </Button>
        ),
        cell: ({ row }) => {
          const index = items.findIndex((it) => it.id === row.original.id);
          return (
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="md:hidden text-[11px] font-mono text-muted-foreground">
                  #{index + 1}
                </span>
                <span className="font-medium text-foreground break-words">
                  {row.original.title}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-none">
                {row.original.slug}
              </div>
              <div className="text-[11px] font-mono text-muted-foreground md:hidden">
                {row.original.postsCount}{" "}
                {row.original.postsCount === 1 ? "post" : "posts"}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "postsCount",
        header: "Posts",
        meta: { className: "hidden md:table-cell" },
        cell: ({ row }) => (
          <span className="text-sm font-mono text-muted-foreground">
            {row.original.postsCount}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Atualizado",
        meta: { className: "hidden md:table-cell" },
        cell: ({ row }) => {
          return (
            <span className="text-sm text-muted-foreground">
              {formatDateBR(row.original.updatedAt)}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const m = row.original;
          const index = items.findIndex((it) => it.id === m.id);
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
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>

                  <DropdownMenuItem asChild>
                    <Link
                      href={`/admin/tecnologias/${technologySlug}/modulos/${m.slug}/posts`}
                      className="gap-2 cursor-pointer"
                    >
                      <i className="bx bx-file text-base mr-1.5" />
                      Acessar posts
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href={`/admin/tecnologias/${technologySlug}/modulos/${m.slug}/posts/novo?moduleId=${m.id}`}
                      className="gap-2 cursor-pointer"
                    >
                      <i className="bx bx-plus-circle text-base mr-1.5 text-blue-500" />
                      Novo post
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    disabled={isFirst || isReordering}
                    onSelect={() => moveItem(index, index - 1)}
                    className="gap-2 cursor-pointer md:hidden"
                  >
                    <i className="bx bx-chevron-up text-base mr-1.5" />
                    Mover para cima
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    disabled={isLast || isReordering}
                    onSelect={() => moveItem(index, index + 1)}
                    className="gap-2 cursor-pointer md:hidden"
                  >
                    <i className="bx bx-chevron-down text-base mr-1.5" />
                    Mover para baixo
                  </DropdownMenuItem>

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
                    className="gap-2 cursor-pointer"
                    onSelect={() => {
                      setEditing({
                        id: m.id,
                        title: m.title,
                        slug: m.slug,
                        technologyId,
                      });
                      setOpenModal(true);
                    }}
                  >
                    <i className="bx bx-pencil text-base mr-1.5" />
                    Editar
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="gap-2 text-rose-500 focus:text-rose-500 cursor-pointer"
                    onSelect={() => setDeleting(m)}
                  >
                    <i className="bx bx-trash text-base mr-1.5 text-rose-500" />
                    Deletar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [items, isReordering, technologyId, technologySlug]
  );

  // table state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Buscar por título..."
              value={
                (table.getColumn("title")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("title")?.setFilterValue(event.target.value)
              }
              className="flex-1 min-w-0 sm:w-72 md:w-80 sm:flex-none"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="hidden md:inline-flex gap-2">
                  <i className="bx bx-slider-alt text-base" />
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
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
                      {column.id === "postsCount"
                        ? "posts"
                        : column.id === "updatedAt"
                        ? "atualizado"
                        : column.id === "title"
                        ? "título"
                        : column.id === "actions"
                        ? "ações"
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-600/90 text-white shrink-0"
            onClick={() => {
              setEditing(null);
              setOpenModal(true);
            }}
          >
            <i className="bx bx-plus text-base" />
            Novo Módulo
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-border">
                  {headerGroup.headers.map((header) => {
                    const metaClass = (
                      header.column.columnDef.meta as { className?: string } | undefined
                    )?.className;
                    return (
                      <TableHead
                        key={header.id}
                        className={`text-muted-foreground font-semibold ${metaClass ?? ""}`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-border hover:bg-muted/30">
                    {row.getVisibleCells().map((cell) => {
                      const metaClass = (
                        cell.column.columnDef.meta as { className?: string } | undefined
                      )?.className;
                      return (
                        <TableCell
                          key={cell.id}
                          className={`align-middle ${metaClass ?? ""}`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-border">
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhum módulo encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-3 mt-4">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} resultado(s)
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <i className="bx bx-chevron-left text-base mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Próxima
              <i className="bx bx-chevron-right text-base ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <ModuleModal
        open={openModal}
        onOpenChange={setOpenModal}
        technologyId={technologyId}
        technologyName={technologyName}
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
            <AlertDialogTitle>Deletar módulo?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso vai remover o módulo{" "}
              <span className="font-semibold text-foreground">
                {deleting?.title}
              </span>{" "}
              e todos os posts vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting || !deleting}
              onClick={() => deleting && handleDelete(deleting)}
              className="bg-rose-600 hover:bg-rose-600/90 text-white"
            >
              {isDeleting ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
