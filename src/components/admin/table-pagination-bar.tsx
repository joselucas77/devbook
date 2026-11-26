"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

interface TablePaginationBarProps<TData> {
  table: Table<TData>;
  itemLabel?: string;
}

export function TablePaginationBar<TData>({
  table,
  itemLabel,
}: TablePaginationBarProps<TData>) {
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      table.setPageSize(mq.matches ? 5 : 10);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [table]);

  const totalFiltered = table.getFilteredRowModel().rows.length;
  const pageCount = Math.max(1, table.getPageCount());
  const pageIndex = table.getState().pagination.pageIndex;
  const currentRowsCount = table.getRowModel().rows.length;

  return (
    <div className="flex items-center justify-between gap-2 px-1 py-1 text-xs sm:text-sm text-muted-foreground">
      <div className="tabular-nums truncate min-w-0">
        <span className="font-semibold text-foreground">{currentRowsCount}</span>{" "}
        de <span className="font-semibold text-foreground">{totalFiltered}</span>
        {itemLabel ? ` ${itemLabel}` : ""}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Página anterior"
          title="Página anterior"
        >
          <i className="bx bx-chevron-left text-lg" />
        </Button>

        <span className="min-w-[3rem] text-center font-mono text-xs tabular-nums text-foreground">
          {pageIndex + 1} / {pageCount}
        </span>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Próxima página"
          title="Próxima página"
        >
          <i className="bx bx-chevron-right text-lg" />
        </Button>
      </div>
    </div>
  );
}
