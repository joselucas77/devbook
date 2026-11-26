import Image from "next/image";

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({
  message = "Carregando conteúdo...",
}: PageLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className="min-h-[55vh] sm:min-h-[60vh] w-full flex flex-col items-center justify-center px-4 py-12 select-none"
    >
      <div className="flex flex-col items-center gap-5 max-w-xs w-full text-center">
        {/* Ícone DevBook com anéis orbitais animados */}
        <div className="relative flex items-center justify-center h-24 w-24 sm:h-28 sm:w-28">
          {/* Brilho suave de fundo */}
          <div className="absolute inset-2 rounded-full bg-blue-500/15 blur-xl animate-pulse" />

          {/* Anel externo giratório */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-500/40 animate-devbook-spin-slow" />

          {/* Anel interno tracejado contra-giratório */}
          <div className="absolute inset-2.5 rounded-full border border-dashed border-blue-400/35 animate-devbook-spin-reverse" />

          {/* Logo central flutuando */}
          <div className="relative flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-card border border-border/80 shadow-sm animate-devbook-float">
            <Image
              src="/devbook-logo.svg"
              alt="DevBook"
              width={40}
              height={40}
              priority
              className="h-9 w-9 sm:h-10 sm:w-10 object-contain"
            />
          </div>
        </div>

        {/* Texto e barra de progresso */}
        <div className="space-y-2.5 w-full flex flex-col items-center">
          <div className="flex items-center gap-1.5 font-mono text-sm sm:text-base font-bold tracking-tight">
            <span className="text-blue-500">Dev</span>
            <span className="text-foreground">Book</span>
            <span className="inline-block h-4 w-1.5 bg-blue-500/80 animate-pulse rounded-[1px] ml-0.5" />
          </div>

          {/* Barra de progresso indeterminada */}
          <div className="w-40 sm:w-48 h-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-blue-500/60 via-blue-500 to-cyan-400 animate-devbook-progress" />
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
