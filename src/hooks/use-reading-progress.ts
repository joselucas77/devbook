"use client";

import { useSyncExternalStore, useCallback } from "react";

export interface FavoritePost {
  postId?: number;
  slug: string;
  title: string;
  technologySlug: string;
  technologyName: string;
  moduleSlug: string;
  moduleTitle: string;
  addedAt: string;
}

const READ_POSTS_KEY = "devbook:read_posts";
const FAVORITES_KEY = "devbook:favorites";

const EMPTY_READ_POSTS: string[] = [];
const EMPTY_FAVORITES: FavoritePost[] = [];

// Usuário autenticado ativo no cliente (para escopo de cache e sincronização com o banco)
let activeUserId: string | null = null;

function getFavoritesStorageKey(userId: string | null = activeUserId): string {
  return userId ? `${FAVORITES_KEY}:${userId}` : FAVORITES_KEY;
}

// Cache referencial para useSyncExternalStore (evita loop infinito de renderização no React 19)
let cachedReadPostsRaw: string | null = null;
let cachedReadPosts: string[] = EMPTY_READ_POSTS;

let cachedFavoritesKey: string | null = null;
let cachedFavoritesRaw: string | null = null;
let cachedFavorites: FavoritePost[] = EMPTY_FAVORITES;

// Store local em memória e listeners para reatividade instantânea
let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(callback: () => void) {
  listeners.push(callback);
  const handleStorage = (e: StorageEvent) => {
    if (
      e.key === READ_POSTS_KEY ||
      e.key === FAVORITES_KEY ||
      e.key === getFavoritesStorageKey()
    ) {
      cachedReadPostsRaw = null;
      cachedFavoritesRaw = null;
      emitChange();
    }
  };
  window.addEventListener("storage", handleStorage);

  return () => {
    listeners = listeners.filter((l) => l !== callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function getReadPostsSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY_READ_POSTS;
  try {
    const raw = localStorage.getItem(READ_POSTS_KEY);
    if (raw === cachedReadPostsRaw) {
      return cachedReadPosts;
    }
    cachedReadPostsRaw = raw;
    cachedReadPosts = raw ? JSON.parse(raw) : EMPTY_READ_POSTS;
    return cachedReadPosts;
  } catch {
    return EMPTY_READ_POSTS;
  }
}

function getFavoritesSnapshot(): FavoritePost[] {
  if (typeof window === "undefined") return EMPTY_FAVORITES;
  try {
    const key = getFavoritesStorageKey();
    const raw = localStorage.getItem(key);
    if (key === cachedFavoritesKey && raw === cachedFavoritesRaw) {
      return cachedFavorites;
    }
    cachedFavoritesKey = key;
    cachedFavoritesRaw = raw;
    cachedFavorites = raw ? JSON.parse(raw) : EMPTY_FAVORITES;
    return cachedFavorites;
  } catch {
    return EMPTY_FAVORITES;
  }
}

const getServerReadPostsSnapshot = () => EMPTY_READ_POSTS;
const getServerFavoritesSnapshot = () => EMPTY_FAVORITES;

function setFavoritesSnapshot(next: FavoritePost[], userId: string | null = activeUserId) {
  if (typeof window === "undefined") return;
  const key = getFavoritesStorageKey(userId);
  const nextRaw = JSON.stringify(next);
  cachedFavoritesKey = key;
  cachedFavoritesRaw = nextRaw;
  cachedFavorites = next;
  localStorage.setItem(key, nextRaw);
  emitChange();
}

function matchesFavorite(
  fav: FavoritePost,
  slug: string,
  moduleSlug?: string,
  technologySlug?: string
) {
  if (fav.slug !== slug) return false;
  if (moduleSlug && fav.moduleSlug !== moduleSlug) return false;
  if (technologySlug && fav.technologySlug !== technologySlug) return false;
  return true;
}

/**
 * Configura o usuário ativo e sincroniza os posts salvos com o banco de dados.
 */
export async function syncSavedPostsForUser(userId: string | null): Promise<void> {
  if (typeof window === "undefined") return;

  activeUserId = userId;
  cachedFavoritesKey = null;
  cachedFavoritesRaw = null;
  emitChange();

  if (!userId) return;

  try {
    // Se houver itens salvos localmente como visitante, migra para a conta autenticada
    const guestRaw = localStorage.getItem(FAVORITES_KEY);
    const guestItems: FavoritePost[] = guestRaw ? JSON.parse(guestRaw) : [];

    if (Array.isArray(guestItems) && guestItems.length > 0) {
      const syncRes = await fetch("/api/saved-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: guestItems.map((item) => ({
            postId: item.postId,
            slug: item.slug,
            moduleSlug: item.moduleSlug,
            technologySlug: item.technologySlug,
          })),
        }),
      });

      if (syncRes.ok) {
        const data = await syncRes.json();
        localStorage.removeItem(FAVORITES_KEY);
        if (Array.isArray(data.items) && activeUserId === userId) {
          setFavoritesSnapshot(data.items, userId);
        }
        return;
      }
    }

    const res = await fetch("/api/saved-posts", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items) && activeUserId === userId) {
        setFavoritesSnapshot(data.items, userId);
      }
    }
  } catch (err) {
    console.warn("Não foi possível sincronizar posts salvos com o servidor:", err);
  }
}

export function useReadingProgress() {
  const readPosts = useSyncExternalStore(
    subscribe,
    getReadPostsSnapshot,
    getServerReadPostsSnapshot
  );

  const favorites = useSyncExternalStore(
    subscribe,
    getFavoritesSnapshot,
    getServerFavoritesSnapshot
  );

  const isPostRead = useCallback(
    (postSlug: string) => readPosts.includes(postSlug),
    [readPosts]
  );

  const togglePostRead = useCallback(
    (postSlug: string): boolean => {
      if (typeof window === "undefined") return false;
      try {
        const current = getReadPostsSnapshot();
        const exists = current.includes(postSlug);
        const next = exists
          ? current.filter((s) => s !== postSlug)
          : [...current, postSlug];

        const nextRaw = JSON.stringify(next);
        cachedReadPostsRaw = nextRaw;
        cachedReadPosts = next;
        localStorage.setItem(READ_POSTS_KEY, nextRaw);
        emitChange();
        return !exists;
      } catch {
        return false;
      }
    },
    []
  );

  const isFavorite = useCallback(
    (postSlug: string, moduleSlug?: string, technologySlug?: string) =>
      favorites.some((f) =>
        matchesFavorite(f, postSlug, moduleSlug, technologySlug)
      ),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (item: Omit<FavoritePost, "addedAt">): boolean => {
      if (typeof window === "undefined") return false;
      try {
        const current = getFavoritesSnapshot();
        const exists = current.some((f) =>
          matchesFavorite(f, item.slug, item.moduleSlug, item.technologySlug)
        );
        const next = exists
          ? current.filter(
              (f) =>
                !matchesFavorite(
                  f,
                  item.slug,
                  item.moduleSlug,
                  item.technologySlug
                )
            )
          : [
              {
                ...item,
                addedAt: new Date().toISOString(),
              },
              ...current,
            ];

        setFavoritesSnapshot(next);

        if (activeUserId) {
          const userIdAtCall = activeUserId;
          if (!exists) {
            fetch("/api/saved-posts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                postId: item.postId,
                slug: item.slug,
                moduleSlug: item.moduleSlug,
                technologySlug: item.technologySlug,
              }),
            })
              .then((res) => (res.ok ? res.json() : null))
              .then((data) => {
                if (data?.items && activeUserId === userIdAtCall) {
                  setFavoritesSnapshot(data.items, userIdAtCall);
                }
              })
              .catch((err) =>
                console.warn("Erro ao salvar post no servidor:", err)
              );
          } else {
            const params = new URLSearchParams({
              slug: item.slug,
              moduleSlug: item.moduleSlug,
              technologySlug: item.technologySlug,
            });
            if (item.postId) params.set("postId", String(item.postId));

            fetch(`/api/saved-posts?${params.toString()}`, {
              method: "DELETE",
            })
              .then((res) => (res.ok ? res.json() : null))
              .then((data) => {
                if (data?.items && activeUserId === userIdAtCall) {
                  setFavoritesSnapshot(data.items, userIdAtCall);
                }
              })
              .catch((err) =>
                console.warn("Erro ao remover post salvo no servidor:", err)
              );
          }
        }

        return !exists;
      } catch {
        return false;
      }
    },
    []
  );

  const getModuleProgress = useCallback(
    (modulePostSlugs: string[]) => {
      if (!modulePostSlugs.length) {
        return { completed: 0, total: 0, percentage: 0 };
      }
      const completed = modulePostSlugs.filter((s) =>
        readPosts.includes(s)
      ).length;
      const total = modulePostSlugs.length;
      const percentage = Math.round((completed / total) * 100);
      return { completed, total, percentage };
    },
    [readPosts]
  );

  return {
    readPosts,
    favorites,
    isPostRead,
    togglePostRead,
    isFavorite,
    toggleFavorite,
    getModuleProgress,
  };
}
