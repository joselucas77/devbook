import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="max-w-3xl mx-auto mb-20 space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-28" />
        </div>
      </div>
      <div className="space-y-3 pt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </section>
  );
}
