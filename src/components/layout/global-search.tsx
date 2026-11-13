"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
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

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Erro ao buscar:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const totalResults =
    (results?.technologies.length ?? 0) +
    (results?.modules.length ?? 0) +
    (results?.posts.length ?? 0);

  function handleSelect() {
    setIsOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
      <div className="relative flex items-center">
        <i className="bx bx-search absolute left-3 text-muted-foreground text-base pointer-events-none" />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen && e.target.value.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder="Pesquisar tecnologia, módulo ou post..."
          className="h-9 pl-9 pr-8 text-xs sm:text-sm bg-muted/40 border-border/60 hover:border-border focus:border-blue-500/70 focus:bg-background transition-colors placeholder:text-muted-foreground/70 font-mono"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults(null);
              setIsOpen(false);
            }}
            className="absolute right-2.5 text-muted-foreground hover:text-foreground text-base"
            title="Limpar pesquisa"
          >
            <i className="bx bx-x" />
          </button>
        )}
      </div>

      {/* Dropdown de Resultados */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-border bg-popover/95 text-popover-foreground shadow-2xl backdrop-blur-md overflow-hidden z-50 max-h-[70vh] overflow-y-auto no-scrollbar animate-in fade-in-0 zoom-in-95 duration-150">
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
