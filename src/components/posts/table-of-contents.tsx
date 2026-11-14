"use client";

import { useEffect, useState } from "react";
import { HeadingItem } from "@/lib/toc";
import { cn } from "@/lib/utils";

interface TableOfContentsProps {
  headings: HeadingItem[];
  className?: string;
}

export function TableOfContents({ headings, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!headings.length) return;

    // Se houver hash inicial na URL, usa ele
    if (typeof window !== "undefined" && window.location.hash) {
      setActiveId(window.location.hash.replace("#", ""));
    } else if (headings[0]) {
      setActiveId(headings[0].id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Encontra o elemento visível mais acima na tela
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Ordena pela posição no topo do viewport
          visibleEntries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0% -60% 0%",
        threshold: 0,
      }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  const handleScrollTo = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      window.history.pushState(null, "", `#${id}`);
      setActiveId(id);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 select-none">
        <i className="bx bx-list-ul text-sm text-primary" /> Nesta página
      </p>

      <nav className="relative border-l border-border/60 pl-3 space-y-1.5">
        {headings.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleScrollTo(e, item.id)}
              className={cn(
                "block text-xs leading-relaxed transition-colors duration-150 rounded-sm",
                item.level === 3 ? "pl-3 text-[11px]" : "pl-1",
                isActive
                  ? "text-primary font-medium border-l-2 border-primary -ml-[13px] pl-3 bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
