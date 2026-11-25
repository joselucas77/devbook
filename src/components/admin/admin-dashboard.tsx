"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface AdminDashboardData {
  metrics: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    scheduledPosts: number;
    archivedPosts: number;
    publicPosts: number;
    totalFavorites: number;
    uniqueFavoritedPosts: number;
    totalTechnologies: number;
    activeTechnologies: number;
    totalModules: number;
    totalUsers: number;
    viewerUsers: number;
  };
  postsByTechnology: {
    id: number;
    name: string;
    slug: string;
    published: number;
    others: number;
    total: number;
    favorites: number;
  }[];
  monthlyActivity: {
    key: string;
    label: string;
    count: number;
    publishedCount: number;
  }[];
  topFavoritedPosts: {
    id: number;
    title: string;
    slug: string;
    moduleId: number;
    moduleTitle: string;
    moduleSlug: string;
    technologyName: string;
    technologySlug: string;
    favoritesCount: number;
    status: string;
  }[];
}

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  const { metrics, postsByTechnology, monthlyActivity, topFavoritedPosts } =
    data;

  const [hoveredStatus, setHoveredStatus] = React.useState<string | null>(null);
  const [hoveredMonth, setHoveredMonth] = React.useState<string | null>(null);
  const [hoveredTechId, setHoveredTechId] = React.useState<number | null>(null);
  const [activeKpiSlide, setActiveKpiSlide] = React.useState(0);
  const kpiCarouselRef = React.useRef<HTMLDivElement>(null);

  const handleKpiScroll = React.useCallback(() => {
    const el = kpiCarouselRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    if (!firstCard) return;
    const step = firstCard.offsetWidth + 12; // card width + gap-3 (12px)
    if (step <= 0) return;
    const index = Math.min(3, Math.max(0, Math.round(el.scrollLeft / step)));
    setActiveKpiSlide(index);
  }, []);

  const scrollToKpiSlide = (index: number) => {
    const el = kpiCarouselRef.current;
    if (!el) return;
    const child = el.children[index] as HTMLElement | undefined;
    if (!child) return;
    el.scrollTo({
      left: child.offsetLeft - el.offsetLeft,
      behavior: "smooth",
    });
    setActiveKpiSlide(index);
  };

  const statusItems = React.useMemo(
    () => [
      {
        key: "PUBLISHED",
        label: "Publicados",
        value: metrics.publishedPosts,
        color: "#10b981",
        dotClass: "bg-emerald-500",
      },
      {
        key: "DRAFT",
        label: "Rascunhos",
        value: metrics.draftPosts,
        color: "#64748b",
        dotClass: "bg-slate-500",
      },
      {
        key: "SCHEDULED",
        label: "Agendados",
        value: metrics.scheduledPosts,
        color: "#f59e0b",
        dotClass: "bg-amber-500",
      },
      {
        key: "ARCHIVED",
        label: "Arquivados",
        value: metrics.archivedPosts,
        color: "#f43f5e",
        dotClass: "bg-rose-500",
      },
    ],
    [metrics]
  );

  // Cálculos do gráfico Donut
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const activeStatus = statusItems.find((s) => s.key === hoveredStatus);

  const donutSegments = React.useMemo(() => {
    const total = metrics.totalPosts;
    if (total <= 0) return [];
    let accumulated = 0;
    return statusItems
      .filter((item) => item.value > 0)
      .map((item) => {
        const fraction = item.value / total;
        const dashLength = fraction * circumference;
        const offset = -accumulated;
        accumulated += dashLength;
        return {
          ...item,
          dashArray: `${dashLength} ${circumference - dashLength}`,
          dashOffset: offset,
          percent: Math.round(fraction * 100),
        };
      });
  }, [metrics.totalPosts, statusItems, circumference]);

  const maxTechPosts = Math.max(
    1,
    ...postsByTechnology.map((t) => t.total)
  );
  const maxMonthlyCount = Math.max(
    1,
    ...monthlyActivity.map((m) => m.count)
  );
  const maxFavoritesCount = Math.max(
    1,
    ...topFavoritedPosts.map((p) => p.favoritesCount)
  );

  const publicationRate =
    metrics.totalPosts > 0
      ? Math.round((metrics.publishedPosts / metrics.totalPosts) * 100)
      : 0;

  return (
    <section aria-label="Dashboard do sistema" className="space-y-4">
      {/* KPIs Principais: Slide horizontal no celular, grid no tablet/desktop */}
      <div className="space-y-2">
        <div
          ref={kpiCarouselRef}
          onScroll={handleKpiScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-1 -mx-4 px-4 no-scrollbar sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:overflow-visible"
        >
          <Card className="py-4 gap-2 snap-start shrink-0 w-[80%] max-w-[300px] sm:w-auto sm:max-w-none">
            <CardHeader className="px-5 flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total de Posts
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <i className="bx bx-file text-lg" />
              </div>
            </CardHeader>
            <CardContent className="px-5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold tabular-nums">
                  {metrics.totalPosts}
                </span>
                <span className="text-xs font-medium text-emerald-500">
                  {publicationRate}% publicados
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.publishedPosts} publicados · {metrics.draftPosts} rascunhos
                {metrics.scheduledPosts > 0
                  ? ` · ${metrics.scheduledPosts} agendados`
                  : ""}
              </p>
            </CardContent>
          </Card>

          <Card className="py-4 gap-2 snap-start shrink-0 w-[80%] max-w-[300px] sm:w-auto sm:max-w-none">
            <CardHeader className="px-5 flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Favoritos (Salvos)
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <i className="bx bxs-bookmark text-lg" />
              </div>
            </CardHeader>
            <CardContent className="px-5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold tabular-nums">
                  {metrics.totalFavorites}
                </span>
                <span className="text-xs text-muted-foreground">marcações</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.uniqueFavoritedPosts} post(s) distintos favoritados
              </p>
            </CardContent>
          </Card>

          <Card className="py-4 gap-2 snap-start shrink-0 w-[80%] max-w-[300px] sm:w-auto sm:max-w-none">
            <CardHeader className="px-5 flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Catálogo
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <i className="bx bx-layer text-lg" />
              </div>
            </CardHeader>
            <CardContent className="px-5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold tabular-nums">
                  {metrics.activeTechnologies}
                </span>
                <span className="text-xs text-muted-foreground">
                  de {metrics.totalTechnologies} tecnologias
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.totalModules} módulos cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="py-4 gap-2 snap-start shrink-0 w-[80%] max-w-[300px] sm:w-auto sm:max-w-none">
            <CardHeader className="px-5 flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Usuários
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
                <i className="bx bx-group text-lg" />
              </div>
            </CardHeader>
            <CardContent className="px-5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold tabular-nums">
                  {metrics.totalUsers}
                </span>
                <span className="text-xs text-muted-foreground">cadastrados</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.viewerUsers} leitores ·{" "}
                {metrics.totalUsers - metrics.viewerUsers} equipe
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Indicadores de slide apenas no celular */}
        <div className="flex items-center justify-center gap-1.5 sm:hidden">
          {[0, 1, 2, 3].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToKpiSlide(idx)}
              aria-label={`Ir para métrica ${idx + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                activeKpiSlide === idx
                  ? "w-5 bg-blue-500"
                  : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>

      {/* Linha 1 de Gráficos: Posts por Tecnologia + Status dos Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 py-5 gap-4">
          <CardHeader className="px-5 pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base">Posts por Tecnologia</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Distribuição de conteúdo publicado e em andamento por tecnologia
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-blue-500 inline-block" />
                Publicados
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-muted-foreground/35 inline-block" />
                Outros
              </span>
            </div>
          </CardHeader>

          <CardContent className="px-5">
            {postsByTechnology.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-muted-foreground text-xs gap-1.5 border border-dashed border-border rounded-lg">
                <i className="bx bx-bar-chart-alt-2 text-2xl opacity-60" />
                <span>Nenhuma tecnologia com posts cadastrados ainda.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {postsByTechnology.map((tech) => {
                  const publishedPct = (tech.published / maxTechPosts) * 100;
                  const othersPct = (tech.others / maxTechPosts) * 100;
                  const isHovered = hoveredTechId === tech.id;

                  return (
                    <Link
                      key={tech.id}
                      href={`/admin/tecnologias/${tech.slug}/modulos`}
                      onMouseEnter={() => setHoveredTechId(tech.id)}
                      onMouseLeave={() => setHoveredTechId(null)}
                      className={cn(
                        "block rounded-lg p-1.5 -mx-1.5 transition-colors",
                        isHovered && "bg-muted/40"
                      )}
                    >
                      <div className="flex items-center justify-between text-xs mb-1 gap-2">
                        <span className="font-medium text-foreground truncate">
                          {tech.name}
                        </span>
                        <div className="flex items-center gap-2 shrink-0 text-[11px] text-muted-foreground tabular-nums">
                          {tech.favorites > 0 && (
                            <span
                              className="inline-flex items-center gap-0.5 text-amber-500"
                              title="Favoritos nesta tecnologia"
                            >
                              <i className="bx bxs-bookmark text-[11px]" />
                              {tech.favorites}
                            </span>
                          )}
                          <span>
                            <strong className="text-foreground font-semibold">
                              {tech.total}
                            </strong>{" "}
                            {tech.total === 1 ? "post" : "posts"}
                          </span>
                        </div>
                      </div>

                      <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden flex">
                        {tech.published > 0 && (
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${publishedPct}%` }}
                            title={`Publicados: ${tech.published}`}
                          />
                        )}
                        {tech.others > 0 && (
                          <div
                            className="h-full bg-muted-foreground/35 transition-all duration-300"
                            style={{ width: `${othersPct}%` }}
                            title={`Rascunhos / Agendados / Arquivados: ${tech.others}`}
                          />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico Donut: Status dos Posts */}
        <Card className="py-5 gap-4">
          <CardHeader className="px-5 pb-0">
            <CardTitle className="text-base">Status dos Posts</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Proporção atual por situação editorial
            </CardDescription>
          </CardHeader>

          <CardContent className="px-5 flex flex-col items-center justify-between gap-4">
            <div className="relative h-36 w-36 flex items-center justify-center">
              <svg
                viewBox="0 0 140 140"
                className="h-full w-full -rotate-90"
                role="img"
                aria-label="Gráfico de distribuição de status dos posts"
              >
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="16"
                  className="text-muted/50"
                />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.key}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={hoveredStatus === seg.key ? 19 : 16}
                    strokeDasharray={seg.dashArray}
                    strokeDashoffset={seg.dashOffset}
                    className="transition-all duration-200 cursor-pointer"
                    opacity={
                      hoveredStatus && hoveredStatus !== seg.key ? 0.45 : 1
                    }
                    onMouseEnter={() => setHoveredStatus(seg.key)}
                    onMouseLeave={() => setHoveredStatus(null)}
                  />
                ))}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                <span className="text-2xl font-bold tabular-nums leading-none">
                  {activeStatus ? activeStatus.value : metrics.totalPosts}
                </span>
                <span className="text-[11px] text-muted-foreground mt-1 truncate max-w-full">
                  {activeStatus ? activeStatus.label : "Posts"}
                </span>
              </div>
            </div>

            <div className="w-full space-y-1.5">
              {statusItems.map((item) => {
                const pct =
                  metrics.totalPosts > 0
                    ? Math.round((item.value / metrics.totalPosts) * 100)
                    : 0;
                return (
                  <div
                    key={item.key}
                    onMouseEnter={() => setHoveredStatus(item.key)}
                    onMouseLeave={() => setHoveredStatus(null)}
                    className={cn(
                      "flex items-center justify-between text-xs px-2 py-1 rounded-md transition-colors cursor-default",
                      hoveredStatus === item.key && "bg-muted/60"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full shrink-0",
                          item.dotClass
                        )}
                      />
                      <span className="text-foreground">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="font-semibold text-foreground">
                        {item.value}
                      </span>
                      <span className="text-muted-foreground w-8 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Linha 2 de Gráficos: Atividade Mensal + Posts Mais Favoritados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="py-5 gap-4">
          <CardHeader className="px-5 pb-0 flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">
                Criação de Posts (6 meses)
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Volume mensal de novos artigos cadastrados no sistema
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-5">
            <div className="h-44 flex items-end justify-between gap-2 sm:gap-3 pt-6 pb-1 border-b border-border/60">
              {monthlyActivity.map((month) => {
                const heightPct = Math.max(
                  month.count > 0 ? 10 : 4,
                  Math.round((month.count / maxMonthlyCount) * 100)
                );
                const isHovered = hoveredMonth === month.key;

                return (
                  <div
                    key={month.key}
                    onMouseEnter={() => setHoveredMonth(month.key)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className="flex-1 h-full flex flex-col items-center justify-end gap-1.5 group"
                  >
                    <span
                      className={cn(
                        "text-[11px] font-mono tabular-nums transition-colors",
                        month.count > 0
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground/50",
                        isHovered && "text-blue-500"
                      )}
                    >
                      {month.count}
                    </span>

                    <div className="w-full max-w-[42px] flex-1 flex items-end">
                      <div
                        className={cn(
                          "w-full rounded-t-md transition-all duration-300 relative overflow-hidden",
                          month.count > 0
                            ? isHovered
                              ? "bg-blue-500"
                              : "bg-blue-500/80"
                            : "bg-muted/60"
                        )}
                        style={{ height: `${heightPct}%` }}
                        title={`${month.label}: ${month.count} post(s) criado(s) (${month.publishedCount} publicado(s))`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-2 sm:gap-3 pt-2">
              {monthlyActivity.map((month) => (
                <div
                  key={month.key}
                  className="flex-1 text-center text-[11px] text-muted-foreground capitalize truncate"
                >
                  {month.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Posts Favoritados */}
        <Card className="py-5 gap-4">
          <CardHeader className="px-5 pb-0 flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">
                Posts Mais Favoritados
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Artigos mais salvos pelos usuários nos favoritos
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className="text-[11px] font-mono tabular-nums shrink-0"
            >
              {metrics.totalFavorites} total
            </Badge>
          </CardHeader>

          <CardContent className="px-5">
            {topFavoritedPosts.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-muted-foreground text-xs gap-1.5 border border-dashed border-border rounded-lg text-center px-4">
                <i className="bx bx-bookmark text-2xl opacity-60" />
                <span>
                  Nenhum post foi marcado como favorito pelos usuários ainda.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {topFavoritedPosts.map((post, index) => {
                  const pct = Math.max(
                    8,
                    Math.round((post.favoritesCount / maxFavoritesCount) * 100)
                  );
                  return (
                    <div key={post.id} className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/admin/tecnologias/${post.technologySlug}/modulos/${post.moduleSlug}/posts/novo?edit=${post.id}&moduleId=${post.moduleId}`}
                            className="text-xs font-medium text-foreground hover:text-blue-500 transition-colors line-clamp-1"
                            title={post.title}
                          >
                            <span className="text-muted-foreground font-mono mr-1.5">
                              #{index + 1}
                            </span>
                            {post.title}
                          </Link>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {post.technologyName} · {post.moduleTitle}
                          </p>
                        </div>

                        <Badge
                          variant="outline"
                          className="shrink-0 h-5 px-1.5 text-[11px] font-mono gap-1 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 tabular-nums"
                        >
                          <i className="bx bxs-bookmark text-[10px]" />
                          {post.favoritesCount}
                        </Badge>
                      </div>

                      <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500/85 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
