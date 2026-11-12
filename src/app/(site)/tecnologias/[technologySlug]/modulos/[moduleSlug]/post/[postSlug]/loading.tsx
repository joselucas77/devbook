import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <article className="max-w-3xl mx-auto mb-20 space-y-6">
      <Skeleton className="h-12 w-4/5" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="space-y-4 pt-6">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-44 w-full rounded-lg" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
      </div>
    </article>
  );
}
