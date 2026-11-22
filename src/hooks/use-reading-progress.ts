"use client";

import { useSyncExternalStore, useCallback } from "react";

export interface FavoritePost {
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

// Cache referencial para useSyncExternalStore (evita loop infinito de renderização no React 19)
let cachedReadPostsRaw: string | null = null;
let cachedReadPosts: string[] = EMPTY_READ_POSTS;

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
    if (e.key === READ_POSTS_KEY || e.key === FAVORITES_KEY) {
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
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw === cachedFavoritesRaw) {
      return cachedFavorites;
    }
    cachedFavoritesRaw = raw;
    cachedFavorites = raw ? JSON.parse(raw) : EMPTY_FAVORITES;
    return cachedFavorites;
  } catch {
    return EMPTY_FAVORITES;
  }
}

const getServerReadPostsSnapshot = () => EMPTY_READ_POSTS;
const getServerFavoritesSnapshot = () => EMPTY_FAVORITES;

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
    (postSlug: string) => favorites.some((f) => f.slug === postSlug),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (item: Omit<FavoritePost, "addedAt">): boolean => {
      if (typeof window === "undefined") return false;
      try {
        const current = getFavoritesSnapshot();
        const exists = current.some((f) => f.slug === item.slug);
        const next = exists
          ? current.filter((f) => f.slug !== item.slug)
          : [
              ...current,
              {
                ...item,
                addedAt: new Date().toISOString(),
              },
            ];

        const nextRaw = JSON.stringify(next);
        cachedFavoritesRaw = nextRaw;
        cachedFavorites = next;
        localStorage.setItem(FAVORITES_KEY, nextRaw);
        emitChange();
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
      const completed = modulePostSlugs.filter((s) => readPosts.includes(s)).length;
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
