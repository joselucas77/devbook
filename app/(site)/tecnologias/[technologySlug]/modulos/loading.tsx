import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <section className="max-w-3xl mx-auto mb-20">
      <div className="mb-10">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-5 w-full max-w-2xl mb-2" />
        <Skeleton className="h-5 w-5/6 max-w-2xl mb-6" />

        <div className="w-full flex items-center justify-between gap-6">
          <div className="flex w-full items-center gap-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-5 rounded" />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
