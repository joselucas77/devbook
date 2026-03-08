import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Círculo de fundo com efeito de brilho */}
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
          
          {/* Container do spinner */}
          <div className="relative rounded-full border border-blue-500/30 bg-gray-900/80 p-5">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-white">Carregando</h2>
          <p className="text-sm text-gray-400">Aguarde um momento...</p>
        </div>
      </div>
    </div>
  );
}
