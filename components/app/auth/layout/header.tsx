"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function Header() {
  const currentPath = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAdminRoute = currentPath.startsWith("/admin");
  const isAdminRoot = currentPath === "/admin";

  async function handleLogout() {
    try {
      setIsLoggingOut(true);

      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Falha ao sair");

      toast.success("Você saiu da conta.");
      router.push("/");
      router.refresh();
    } catch (e: any) {
      toast.error("Erro ao sair", { description: e?.message });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="py-4 border-b border-gray-800">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter">
          Dev<span className="text-blue-500">Book</span>
        </Link>

        {/* ADMIN */}
        {isAdminRoute ? (
          <div className="flex items-center gap-3">
            {/* Só mostra VOLTAR se NÃO for /admin */}
            {!isAdminRoot && (
              <Button
                variant="link"
                onClick={() => router.back()}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}

            <Button
              variant="destructive"
              className="bg-blue-600 text-white hover:bg-blue-600/90 transition-colors"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Saindo..." : "Sair"}
            </Button>
          </div>
        ) : (
          /* FORA DO ADMIN */
          <div className="flex items-center space-x-6">
            <Button
              variant="destructive"
              className="bg-blue-600 text-white hover:bg-blue-600/90 transition-colors"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Saindo..." : "Sair"}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
