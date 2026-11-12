"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <i className="bx bx-check-circle text-base text-emerald-500" />,
        info: <i className="bx bx-info-circle text-base text-blue-500" />,
        warning: <i className="bx bx-error text-base text-amber-500" />,
        error: <i className="bx bx-x-circle text-base text-rose-500" />,
        loading: <i className="bx bx-loader-alt text-base animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
