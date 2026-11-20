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
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(READ_POSTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getFavoritesSnapshot(): FavoritePost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useReadingProgress() {
  const readPosts = useSyncExternalStore(
    subscribe,
    getReadPostsSnapshot,
    () => [] as string[]
  );

  const favorites = useSyncExternalStore(
    subscribe,
    getFavoritesSnapshot,
    () => [] as FavoritePost[]
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

        localStorage.setItem(READ_POSTS_KEY, JSON.stringify(next));
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

        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
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
