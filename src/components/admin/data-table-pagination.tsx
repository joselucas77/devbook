"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

export function DataTablePagination<TData>({
  table,
}: {
  table: Table<TData>;
}) {
  return (
    <div className="flex items-center justify-between px-2 py-3 border-t border-border/40">
      <div className="text-sm text-muted-foreground">
        Página {table.getState().pagination.pageIndex + 1} de{" "}
        {table.getPageCount() || 1}
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
  );
}
