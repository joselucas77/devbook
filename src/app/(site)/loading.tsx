export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
          <div className="relative rounded-full border border-blue-500/30 bg-card p-5">
            <i className="bx bx-loader-alt animate-spin text-3xl text-blue-500" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            Carregando os dados
          </h2>
          <p className="text-xs text-muted-foreground">Aguarde um momento...</p>
        </div>
      </div>
    </div>
  );
}
