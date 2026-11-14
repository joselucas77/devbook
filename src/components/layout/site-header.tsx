"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface SiteHeaderProps extends React.ComponentProps<"header"> {
  user?: {
    name: string;
    email: string;
    role?: string;
  } | null;
}

export function SiteHeader({
  className,
  user: _user,
  ...props
}: SiteHeaderProps) {
  void _user;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-6",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <SidebarTrigger />
        <span className="font-semibold text-sm md:text-base text-foreground font-mono">
          Painel de Administração
        </span>
      </div>

      <div className="flex items-center">
        <ThemeToggle />
      </div>
    </header>
  );
}
