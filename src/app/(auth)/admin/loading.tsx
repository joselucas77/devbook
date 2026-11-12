export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <i className="bx bx-loader-alt animate-spin text-4xl text-blue-500" />
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold text-foreground">
          Carregando painel
        </h2>
        <p className="text-xs text-muted-foreground">Aguarde um momento...</p>
      </div>
    </div>
  );
}
