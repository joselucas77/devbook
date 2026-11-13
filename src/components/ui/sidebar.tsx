"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("devbook:sidebar_state");
      if (saved !== null) {
        _setOpen(saved === "true");
      }
    } catch {}
  }, []);

  const setOpen = React.useCallback(
    (value: boolean) => {
      try {
        localStorage.setItem("devbook:sidebar_state", String(value));
      } catch {}
      if (setOpenProp) {
        setOpenProp(value);
      } else {
        _setOpen(value);
      }
    },
    [setOpenProp]
  );

  const toggleSidebar = React.useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggleSidebar }}>
      <div
        className={cn(
          "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar, open } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      title={open ? "Recolher barra lateral" : "Expandir barra lateral"}
      className={cn("h-9 w-9 text-muted-foreground hover:text-foreground", className)}
      {...props}
    >
      <i
        className={cn(
          "bx text-xl transition-transform duration-200",
          open ? "bx-sidebar" : "bx-sidebar"
        )}
      />
    </Button>
  );
}

export function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      className={cn(
        "relative flex min-h-svh flex-1 flex-col min-w-0 bg-background transition-all duration-200 ease-in-out md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className
      )}
      {...props}
    />
  );
}
