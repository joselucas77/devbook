"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SearchResultTech {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
}

interface SearchResultModule {
  id: number;
  title: string;
  slug: string;
  technology: {
    name: string;
    slug: string;
  };
}

interface SearchResultPost {
  id: number;
  title: string;
  slug: string;
  summary: string;
  module: {
    title: string;
    slug: string;
    technology: {
      name: string;
      slug: string;
    };
  };
}

interface SearchResponse {
  technologies: SearchResultTech[];
  modules: SearchResultModule[];
  posts: SearchResultPost[];
}

interface GlobalSearchProps {
  variant?: "header" | "bottom-bar";
  className?: string;
  autoFocus?: boolean;
  collapsed?: boolean;
  onExpand?: () => void;
  onClose?: () => void;
}

export function GlobalSearch({
  variant = "header",
  className,
  autoFocus,
  collapsed = false,
  onExpand,
  onClose,
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const isBottomBar = variant === "bottom-bar";

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    let isCurrent = true;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`
        );
        if (res.ok && isCurrent) {
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Erro ao buscar:", err);
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        onClose?.();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        onClose?.();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const totalResults =
    (results?.technologies.length ?? 0) +
    (results?.modules.length ?? 0) +
    (results?.posts.length ?? 0);

  function handleSelect() {
    setIsOpen(false);
    setQuery("");
    onClose?.();
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isBottomBar
          ? collapsed
            ? "w-12 h-12 max-w-[48px]"
            : "w-full max-w-sm sm:max-w-md h-11 sm:h-12"
          : "w-full max-w-xs sm:max-w-sm md:max-w-md",
        className
      )}
    >
      {/* Container do Input */}
      {isBottomBar ? (
        <div
          onClick={() => {
            if (collapsed) {
              onExpand?.();
            }
          }}
          className={cn(
            "relative flex items-center rounded-full bg-card/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-border/80 shadow-2xl shadow-black/40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden",
            collapsed
              ? "w-12 h-12 justify-center cursor-pointer hover:bg-muted/80 active:scale-95 px-0"
              : "w-full px-3.5 h-11 sm:h-12 focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20"
          )}
          title={collapsed ? "Pesquisar" : undefined}
        >
          <i
            className={cn(
              "bx bx-search shrink-0 transition-all duration-300 pointer-events-none",
              collapsed
                ? "text-xl text-foreground m-0"
                : "text-lg text-muted-foreground mr-2.5"
            )}
          />

          <div
            className={cn(
              "flex-1 flex items-center transition-all duration-200 min-w-0",
              collapsed
                ? "w-0 opacity-0 pointer-events-none -translate-x-2 invisible"
                : "w-full opacity-100 pointer-events-auto translate-x-0 visible"
            )}
          >
            <input
              ref={inputRef}
              type="text"
              autoFocus={autoFocus}
              value={query}
              tabIndex={collapsed ? -1 : 0}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                if (val.trim().length < 2) {
                  setResults(null);
                  setIsOpen(false);
                } else if (!isOpen) {
                  setIsOpen(true);
                }
              }}
              onFocus={() => {
                if (query.trim().length >= 2) setIsOpen(true);
              }}
              placeholder="Pesquisar tecnologia, módulo ou post..."
              className="w-full bg-transparent border-none text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 font-mono outline-none focus:outline-none focus:ring-0 p-0"
            />

            {query && !collapsed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuery("");
                  setResults(null);
                  setIsOpen(false);
                }}
                className="text-muted-foreground hover:text-foreground text-lg ml-2 shrink-0 flex items-center justify-center h-6 w-6 rounded-full hover:bg-muted/60 transition-colors"
                title="Limpar pesquisa"
              >
                <i className="bx bx-x" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="relative flex items-center rounded-lg bg-muted/40 border border-border/60 hover:border-border focus-within:border-blue-500/70 focus-within:bg-background transition-colors px-3 h-9 overflow-hidden">
          <i className="bx bx-search text-muted-foreground text-base shrink-0 mr-2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (val.trim().length < 2) {
                setResults(null);
                setIsOpen(false);
              } else if (!isOpen) {
                setIsOpen(true);
              }
            }}
            onFocus={() => {
              if (query.trim().length >= 2) setIsOpen(true);
            }}
            placeholder={
              isBottomBar
                ? "Pesquisar tecnologia, módulo ou post..."
                : "Pesquisar..."
            }
            className="w-full bg-transparent border-none text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 font-mono outline-none focus:outline-none focus:ring-0 p-0"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults(null);
                setIsOpen(false);
              }}
              className="text-muted-foreground hover:text-foreground text-base ml-1 shrink-0 flex items-center justify-center h-5 w-5 rounded-full hover:bg-muted/80"
              title="Limpar pesquisa"
            >
              <i className="bx bx-x" />
            </button>
          )}
        </div>
      )}

      {/* Dropdown de Resultados: Para cima na barra inferior, para baixo no header */}
      {isOpen && !collapsed && query.trim().length >= 2 && (
        <div
          className={cn(
            "absolute rounded-2xl border border-border bg-popover/95 text-popover-foreground shadow-2xl backdrop-blur-md overflow-hidden z-50 overflow-y-auto no-scrollbar duration-150 animate-in fade-in-0",
            isBottomBar
              ? "left-0 right-0 bottom-full mb-3 max-h-[55vh] zoom-in-95 slide-in-from-bottom-2"
              : "right-0 w-80 sm:w-96 max-w-[calc(100vw-2rem)] top-full mt-2 max-h-[70vh] zoom-in-95 slide-in-from-top-2"
          )}
        >
          {isLoading ? (
            <div className="p-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <i className="bx bx-loader-alt animate-spin text-base text-blue-500" />
              <span>Buscando no DevBook...</span>
            </div>
          ) : totalResults === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              <i className="bx bx-search-alt-2 text-2xl mb-1.5 block opacity-50" />
              Nenhum resultado encontrado para &ldquo;<span className="text-foreground font-semibold">{query}</span>&rdquo;
            </div>
          ) : (
            <div className="p-2 space-y-3">
              {/* Seção: Tecnologias */}
              {results && results.technologies.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/40 mb-1">
                    <i className="bx bx-code-block text-blue-400" />
                    Tecnologias
                  </div>
                  <div className="space-y-0.5">
                    {results.technologies.map((tech) => (
                      <Link
                        key={`tech-${tech.id}`}
                        href={`/tecnologias/${tech.slug}/modulos`}
                        onClick={handleSelect}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors text-xs group"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground group-hover:text-blue-400 transition-colors truncate">
                            {tech.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {tech.description}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="shrink-0 text-[10px] px-1.5 py-0 border-blue-500/30 text-blue-400"
                        >
                          {tech.category}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Seção: Módulos */}
              {results && results.modules.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/40 mb-1">
                    <i className="bx bx-folder text-amber-400" />
                    Módulos
                  </div>
                  <div className="space-y-0.5">
                    {results.modules.map((mod) => (
                      <Link
                        key={`mod-${mod.id}`}
                        href={`/tecnologias/${mod.technology.slug}/modulos`}
                        onClick={handleSelect}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors text-xs group"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground group-hover:text-amber-400 transition-colors truncate">
                            {mod.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <span>em</span>
                            <span className="font-medium text-foreground/80">
                              {mod.technology.name}
                            </span>
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="shrink-0 text-[10px] px-1.5 py-0 border-amber-500/30 text-amber-400"
                        >
                          Módulo
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Seção: Posts */}
              {results && results.posts.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/40 mb-1">
                    <i className="bx bx-book-open text-emerald-400" />
                    Posts & Documentações
                  </div>
                  <div className="space-y-0.5">
                    {results.posts.map((post) => (
                      <Link
                        key={`post-${post.id}`}
                        href={`/tecnologias/${post.module.technology.slug}/modulos/${post.module.slug}/post/${post.slug}`}
                        onClick={handleSelect}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors text-xs group"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground group-hover:text-emerald-400 transition-colors truncate">
                            {post.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                            <span>{post.module.technology.name}</span>
                            <span>&rsaquo;</span>
                            <span>{post.module.title}</span>
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="shrink-0 text-[10px] px-1.5 py-0 border-emerald-500/30 text-emerald-400"
                        >
                          Post
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
