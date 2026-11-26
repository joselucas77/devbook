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
import { toast } from "sonner";
import { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

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
  TechnologyModal,
  type TechnologyRow,
} from "@/components/admin/technology-modal";
import { formatDateBR } from "@/lib/format-date";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TablePaginationBar } from "@/components/admin/table-pagination-bar";

export type Row = {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  image: string | null;
  order: number;
  isArchived: boolean;
  modulesCount: number;
  createdAt: string;
  updatedAt: string;
};

const TechnologyCategories = [
  "Linguagens",
  "Markups & Estilos",
  "Frameworks & Libs",
  "Infra & DevOps",
  "Gerenciamento de Dados",
  "Ferramentas & Utilitários",
];

export function TechnologiesTable({ data }: { data: Row[] }) {
  const router = useRouter();

  // local items state for optimistic reordering
  const [items, setItems] = useState<Row[]>(data);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
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
          type: "technologies",
          orderedIds: newItems.map((item) => item.id),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? "Falha ao reordenar tecnologias");
      }

      toast.success("Ordem atualizada com sucesso!");
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

  async function handleToggleArchive(row: Row) {
    const nextArchived = !row.isArchived;
    try {
      const res = await fetch(`/api/admin/technologies/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: nextArchived }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? "Falha ao alterar status de arquivamento");
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, isArchived: nextArchived } : item
        )
      );

      toast.success(
        nextArchived
          ? "Tecnologia arquivada com sucesso"
          : "Tecnologia desarquivada com sucesso"
      );
      router.refresh();
    } catch (e: any) {
      toast.error("Erro ao alterar status", { description: e?.message });
      console.error(e);
    }
  }

  const columns = useMemo<ColumnDef<Row>[]>(
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
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 gap-1 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nome <i className="bx bx-sort text-sm ml-1" />
          </Button>
        ),
        cell: ({ row }) => {
          const index = items.findIndex((it) => it.id === row.original.id);
          return (
            <div className="space-y-1 min-w-0 max-w-full overflow-hidden">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="md:hidden text-[11px] font-mono text-muted-foreground shrink-0">
                  #{index + 1}
                </span>
                <span
                  className="font-medium text-foreground truncate block min-w-0 flex-1"
                  title={row.original.name}
                >
                  {row.original.name}
                </span>
                {row.original.isArchived && (
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 text-amber-500 bg-amber-500/10 text-[10px] px-1.5 py-0 h-4 font-mono font-normal shrink-0"
                  >
                    Arquivada
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {row.original.slug}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground md:hidden truncate">
                <span className="truncate">{row.original.category}</span>
                <span className="shrink-0">•</span>
                <span className="font-mono shrink-0">
                  {row.original.modulesCount}{" "}
                  {row.original.modulesCount === 1 ? "módulo" : "módulos"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Categoria",
        meta: { className: "hidden md:table-cell" },
        filterFn: (row, columnId, filterValue) => {
          return row.getValue(columnId) === filterValue;
        },
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.category}</span>
        ),
      },
      {
        accessorKey: "modulesCount",
        header: "Módulos",
        meta: { className: "hidden md:table-cell" },
        cell: ({ row }) => (
          <span className="text-sm font-mono text-muted-foreground">
            {row.original.modulesCount}
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
        meta: { className: "w-12 text-right" },
        cell: ({ row }) => {
          const t = row.original;
          const index = items.findIndex((it) => it.id === t.id);
          const isFirst = index <= 0;
          const isLast = index === items.length - 1;

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <i className="bx bx-dots-vertical-rounded text-lg" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>

                  <DropdownMenuItem asChild>
                    <Link
                      href={`/admin/tecnologias/${t.slug}/modulos`}
                      className="gap-2 cursor-pointer"
                    >
                      <i className="bx bx-link-external text-base mr-1.5" />
                      Acessar módulos
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
                    onSelect={() => handleToggleArchive(t)}
                  >
                    <i
                      className={`bx ${
                        t.isArchived
                          ? "bx-archive-out text-emerald-400"
                          : "bx-archive-in text-amber-400"
                      } text-base mr-1.5`}
                    />
                    {t.isArchived ? "Desarquivar" : "Arquivar"}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onSelect={() => {
                      setEditing({
                        id: t.id,
                        name: t.name,
                        slug: t.slug,
                        category: t.category,
                        description: t.description,
                        image: t.image,
                        isArchived: t.isArchived,
                      });
                      setOpenModal(true);
                    }}
                  >
                    <i className="bx bx-pencil text-base mr-1.5" />
                    Editar
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="gap-2 text-rose-500 focus:text-rose-500 cursor-pointer"
                    onSelect={() => setDeleting(t)}
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
    [items, isReordering]
  );

  // table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all");

  const filteredItems = useMemo(() => {
    if (statusFilter === "active") {
      return items.filter((it) => !it.isArchived);
    }
    if (statusFilter === "archived") {
      return items.filter((it) => it.isArchived);
    }
    return items;
  }, [items, statusFilter]);

  const table = useReactTable({
    data: filteredItems,
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

  const hasActiveFilters = categoryFilter !== "all" || statusFilter !== "all";

  return (
    <>
      <div className="space-y-3 pb-20 md:pb-0">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Input
              placeholder="Buscar por nome..."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="flex-1 min-w-0 sm:w-64 sm:flex-none"
            />

            {/* Botão de filtros compacto (somente ícone no celular) */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="md:hidden h-9 w-9 shrink-0 relative"
                  aria-label="Filtros"
                  title="Filtros"
                >
                  <i className="bx bx-filter-alt text-lg" />
                  {hasActiveFilters && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[min(calc(100vw-2rem),18rem)] p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Filtros</span>
                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-muted-foreground"
                      onClick={() => {
                        setCategoryFilter("all");
                        setStatusFilter("all");
                        table.getColumn("category")?.setFilterValue(undefined);
                      }}
                    >
                      Limpar
                    </Button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Categoria
                  </label>
                  <Select
                    value={categoryFilter}
                    onValueChange={(value) => {
                      setCategoryFilter(value);
                      if (value === "all") {
                        table.getColumn("category")?.setFilterValue(undefined);
                      } else {
                        table.getColumn("category")?.setFilterValue(value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Filtrar por categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {TechnologyCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Status
                  </label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) =>
                      setStatusFilter(value as "all" | "active" | "archived")
                    }
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="active">Apenas ativas</SelectItem>
                      <SelectItem value="archived">Apenas arquivadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>

            {/* Filtros completos no Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Select
                value={categoryFilter}
                onValueChange={(value) => {
                  setCategoryFilter(value);

                  if (value === "all") {
                    table.getColumn("category")?.setFilterValue(undefined);
                  } else {
                    table.getColumn("category")?.setFilterValue(value);
                  }
                }}
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {TechnologyCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as "all" | "active" | "archived")
                }
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Apenas ativas</SelectItem>
                  <SelectItem value="archived">Apenas arquivadas</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="gap-2">
                    <i className="bx bx-slider-alt text-base" />
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
          </div>

          <Button
            className="hidden md:inline-flex gap-2 bg-blue-600 hover:bg-blue-600/90 text-white shrink-0"
            onClick={() => {
              setEditing(null);
              setOpenModal(true);
            }}
          >
            <i className="bx bx-plus text-base" />
            Nova Tecnologia
          </Button>
        </div>

        {/* Paginação acima da tabela */}
        <TablePaginationBar table={table} itemLabel="tecnologias" />

        {/* Table */}
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <Table className="table-fixed md:table-auto">
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
                    Nenhuma tecnologia encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Botão flutuante (Somente Mobile) */}
      <Button
        type="button"
        size="icon"
        onClick={() => {
          setEditing(null);
          setOpenModal(true);
        }}
        className="md:hidden fixed bottom-5 right-5 z-30 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-600/90 text-white shadow-md"
        aria-label="Nova Tecnologia"
        title="Nova Tecnologia"
      >
        <i className="bx bx-plus text-2xl" />
      </Button>

      {/* Create/Edit Sheet */}
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
              <span className="font-semibold text-foreground">
                {deleting?.name}
              </span>{" "}
              e todos os seus módulos e posts vinculados.
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
