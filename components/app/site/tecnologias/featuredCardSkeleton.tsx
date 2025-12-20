import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedCardSkeleton() {
  return (
    <Card>
      <div className="relative h-48 w-full">
        <Skeleton className="h-48 w-full rounded-b-none" />
      </div>
      <CardHeader className="flex justify-between">
        <Skeleton className="w-38 h-6" />
        <Skeleton className="w-32 h-6 rounded-2xl" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20" />
      </CardContent>
      <CardFooter className="flex justify-between pb-6">
        <div className="flex items-center gap-1">
          <Skeleton className="w-28 h-6" />
        </div>
        <Skeleton className="w-28 h-6" />
      </CardFooter>
    </Card>
  );
}
