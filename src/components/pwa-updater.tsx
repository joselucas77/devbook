"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function PWAUpdater() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Em ambiente de desenvolvimento, não registra o Service Worker e limpa eventuais resíduos
    if (process.env.NODE_ENV === "development") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
      return;
    }

    // Em produção, registra o Service Worker normalmente
    navigator.serviceWorker.register("/sw.js").catch(console.error);

    // Detecta quando o novo Service Worker assumiu o controle
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      toast.info("Atualização disponível", {
        description: "Aplicando a nova versão do sistema...",
        duration: 3000,
      });

      // Recarrega suavemente a aplicação após o toast
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    });
  }, []);

  return null;
}
