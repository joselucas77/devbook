"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;

    const updateProgress = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;

      if (scrollHeight <= 0) {
        setProgress(0);
        return;
      }

      const percent = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
      setProgress(percent);
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        updateProgress();
        rafId = null;
      });
    };

    updateProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <Progress
      value={progress}
      aria-label="Progresso de leitura"
      className="h-1 w-full rounded-none bg-blue-500/15"
      indicatorClassName="bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
    />
  );
}
