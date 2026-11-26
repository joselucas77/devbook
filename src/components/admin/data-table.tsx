"use client";

import * as React from "react";
import Link from "next/link";
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

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePaginationBar } from "./table-pagination-bar";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  technologyId?: number;
  moduleId?: number;
  technologySlug?: string;
  moduleSlug?: string;
  searchPlaceholder?: string;
  searchColumnId?: string;
  filterColumnId?: string;
  filterPlaceholder?: string;
  filterOptions?: { label: string; value: string }[];
  itemLabel?: string;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  technologyId,
  moduleId,
  technologySlug,
  moduleSlug,
  searchPlaceholder = "Pesquisar...",
  searchColumnId,
  filterColumnId,
  filterPlaceholder = "Todos os status",
  filterOptions,
  itemLabel,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  const searchValue = searchColumnId
    ? (table.getColumn(searchColumnId)?.getFilterValue() as string) ?? ""
    : "";

  const filterValue = filterColumnId
    ? ((table.getColumn(filterColumnId)?.getFilterValue() as string) ?? "all")
    : "all";

  const hasFilter = Boolean(filterColumnId && filterOptions?.length);
  const hasActiveFilter = hasFilter && filterValue !== "all";

  const newPostHref =
    (technologySlug && moduleSlug) || (technologyId && moduleId)
      ? technologySlug && moduleSlug
        ? `/admin/tecnologias/${technologySlug}/modulos/${moduleSlug}/posts/novo?moduleId=${moduleId}`
        : `/admin/tecnologias/${technologyId}/modulos/${moduleId}/posts/novo?moduleId=${moduleId}`
      : null;

  return (
    <div className="space-y-3 pb-20 md:pb-0">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          {searchColumnId ? (
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) =>
                table
                  .getColumn(searchColumnId)
                  ?.setFilterValue(event.target.value)
              }
              className="flex-1 min-w-0 md:w-[300px] md:flex-none"
            />
          ) : null}

          {hasFilter && (
            <>
              {/* Filtro somente ícone no celular */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="md:hidden h-9 w-9 shrink-0 relative"
                    aria-label="Filtrar"
                    title="Filtrar"
                  >
                    <i className="bx bx-filter-alt text-lg" />
                    {hasActiveFilter && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-[min(calc(100vw-2rem),16rem)] p-3 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Filtrar por status</span>
                    {hasActiveFilter && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground"
                        onClick={() =>
                          table.getColumn(filterColumnId!)?.setFilterValue(undefined)
                        }
                      >
                        Limpar
                      </Button>
                    )}
                  </div>
                  <Select
                    value={filterValue}
                    onValueChange={(value) =>
                      table
                        .getColumn(filterColumnId!)
                        ?.setFilterValue(value === "all" ? undefined : value)
                    }
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder={filterPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{filterPlaceholder}</SelectItem>
                      {filterOptions!.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </PopoverContent>
              </Popover>

              {/* Select completo no Desktop */}
              <div className="hidden md:block">
                <Select
                  value={filterValue}
                  onValueChange={(value) =>
                    table
                      .getColumn(filterColumnId!)
                      ?.setFilterValue(value === "all" ? undefined : value)
                  }
                >
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder={filterPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{filterPlaceholder}</SelectItem>
                    {filterOptions!.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="hidden md:inline-flex gap-2">
                <i className="bx bx-slider-alt text-base" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "title"
                        ? "Título"
                        : column.id === "order"
                        ? "Ordem"
                        : column.id === "status"
                        ? "Status"
                        : column.id === "isPublic"
                        ? "Público"
                        : column.id === "actions"
                        ? "Ações"
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {newPostHref ? (
          <Button
            asChild
            className="hidden md:inline-flex gap-2 bg-blue-600 hover:bg-blue-600/90 text-white shrink-0"
            title="Criar novo post"
          >
            <Link href={newPostHref}>
              <i className="bx bx-plus text-base" />
              Novo Post
            </Link>
          </Button>
        ) : null}
      </div>

      {/* Paginação acima da tabela */}
      <TablePaginationBar table={table} itemLabel={itemLabel} />

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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-border hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => {
                    const metaClass = (
                      cell.column.columnDef.meta as { className?: string } | undefined
                    )?.className;
                    return (
                      <TableCell
                        key={cell.id}
                        className={`text-foreground align-middle ${metaClass ?? ""}`}
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
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Botão flutuante (Somente Mobile) */}
      {newPostHref ? (
        <Button
          asChild
          size="icon"
          className="md:hidden fixed bottom-5 right-5 z-30 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-600/90 text-white shadow-md"
          aria-label="Novo Post"
          title="Novo Post"
        >
          <Link href={newPostHref}>
            <i className="bx bx-plus text-2xl" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
