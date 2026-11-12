"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="relative h-8 w-16 rounded-full bg-muted"
        aria-label="Toggle theme"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        theme-toggle group relative flex h-9 w-18 items-center rounded-full p-1 
        transition-all duration-500 ease-in-out focus-visible:outline-none 
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        ${
          isDark
            ? "bg-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_0_20px_rgba(99,102,241,0.15)]"
            : "bg-sky-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_0_20px_rgba(250,204,21,0.2)]"
        }
      `}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      role="switch"
      aria-checked={isDark}
    >
      {/* Background stars (visible in dark mode) */}
      <div
        className={`
          pointer-events-none absolute inset-0 overflow-hidden rounded-full 
          transition-opacity duration-500
          ${isDark ? "opacity-100" : "opacity-0"}
        `}
      >
        <span className="absolute left-3 top-2 h-0.5 w-0.5 rounded-full bg-white animate-twinkle" />
        <span className="absolute left-5 top-4 h-0.75 w-0.75 rounded-full bg-white/80 animate-twinkle-delayed" />
        <span className="absolute right-6 top-2.5 h-0.5 w-0.5 rounded-full bg-white/60 animate-twinkle-slow" />
        <span className="absolute left-8 top-1.5 h-0.5 w-0.5 rounded-full bg-white/70 animate-twinkle" />
        <span className="absolute right-3 top-5 h-0.5 w-0.5 rounded-full bg-white/50 animate-twinkle-delayed" />
      </div>

      {/* Background clouds (visible in light mode) */}
      <div
        className={`
          pointer-events-none absolute inset-0 overflow-hidden rounded-full 
          transition-opacity duration-500
          ${isDark ? "opacity-0" : "opacity-100"}
        `}
      >
        <span className="absolute right-3 top-2 h-2 w-4 rounded-full bg-white/60 animate-cloud-drift" />
        <span className="absolute right-7 top-4 h-1.5 w-3 rounded-full bg-white/40 animate-cloud-drift-slow" />
      </div>

      {/* Toggle knob with icon */}
      <div
        className={`
          relative flex h-7 w-7 items-center justify-center rounded-full 
          transition-all duration-500 ease-[cubic-bezier(0.68,-0.2,0.27,1.3)]
          ${
            isDark
              ? "translate-x-9 bg-indigo-200 shadow-[0_0_12px_rgba(165,180,252,0.5)]"
              : "translate-x-0 bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
          }
        `}
      >
        {/* Sun */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-500
            ${isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-amber-700"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        </div>

        {/* Moon */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-500
            ${isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-indigo-700"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            <path d="M19 3v4" />
            <path d="M21 5h-4" />
          </svg>
        </div>
      </div>
    </button>
  );
}
