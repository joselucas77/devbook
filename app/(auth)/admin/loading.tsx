import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="rounded-full border border-gray-800 bg-gray-900/40 p-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Carregando…</h2>
            <p className="text-sm text-gray-400">
              Preparando o conteúdo pra você.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
