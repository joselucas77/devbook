"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Admin", href: "/admin", icon: "bx-code-alt" },
  { label: "Ver Site", href: "/tecnologias", icon: "bx-globe" },
];

export function BottomNavigation({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-background/95 px-2 backdrop-blur md:hidden",
        className
      )}
      {...props}
    >
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
              "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-md px-3 text-xs font-medium transition-colors",
              active
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <i className={cn("bx text-xl", item.icon)} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
