"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AppSidebarProps extends React.ComponentProps<"aside"> {
  variant?: "default" | "inset" | "floating";
}

const navItems = [
  { label: "Tecnologias", href: "/admin", icon: "bx-code-alt" },
  { label: "Ver Site", href: "/tecnologias", icon: "bx-globe" },
];

export function AppSidebar({
  className,
  variant = "inset",
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      data-variant={variant}
      className={cn(
        "hidden md:flex md:w-64 md:flex-col border-r border-border bg-card shrink-0 transition-all duration-200",
        className
      )}
      {...props}
    >
      <div className="flex h-16 items-center px-6 border-b border-border font-bold text-lg tracking-tight">
        <Link href="/admin" className="flex items-center gap-1.5">
          Dev<span className="text-blue-500">Book</span>
          <span className="text-xs bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded ml-1 font-mono uppercase">
            Admin
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin" || pathname.startsWith("/admin/")
              : pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <i className={cn("bx text-xl", item.icon)} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
