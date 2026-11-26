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
      className="min-h-[calc(100dvh-11rem)] sm:min-h-[calc(100dvh-12rem)] w-full flex items-center justify-center px-4 py-8 select-none"
    >
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
    </div>
  );
}
