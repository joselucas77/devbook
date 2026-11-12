import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-border/40">
      <div className="relative h-56 w-full">
        <Skeleton className="h-56 w-full rounded-none" />
      </div>
      <CardHeader className="flex justify-between p-5">
        <Skeleton className="w-36 h-6" />
        <Skeleton className="w-24 h-6 rounded-full" />
      </CardHeader>
      <CardContent className="px-5 py-0">
        <Skeleton className="h-4 w-3/4 mb-4" />
      </CardContent>
      <CardFooter className="px-5 pb-5 pt-2">
        <Skeleton className="h-10 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
}
