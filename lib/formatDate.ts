export function formatDateBR(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatDatePtBR(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Maceio",
  }).format(date);
}
