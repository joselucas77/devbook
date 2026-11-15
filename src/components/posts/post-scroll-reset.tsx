"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PostScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    // Se a URL contiver hash (#ancora), deixa o navegador navegar para a âncora
    if (typeof window !== "undefined" && window.location.hash) {
      return;
    }

    // Reseta imediatamente o scroll para o topo da página
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // requestAnimationFrame garante execução logo após o ciclo de renderização
    const rAF = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });

    // Timeout de segurança para neutralizar a restauração de scroll do navegador mobile
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 60);

    return () => {
      cancelAnimationFrame(rAF);
      clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
