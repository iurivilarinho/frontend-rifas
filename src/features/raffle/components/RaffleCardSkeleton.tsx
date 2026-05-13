import { Skeleton } from "@/components/skeleton/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";

export const RaffleCardSkeleton = () => (
  <Card className="overflow-hidden border-border">
    <Skeleton className="aspect-[16/9] w-full rounded-none" />
    <CardContent className="space-y-3 p-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-2 w-full" />
      <div className="flex items-end justify-between pt-2">
        <div className="space-y-1">
          <Skeleton className="h-2 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-3 w-20" />
      </div>
    </CardContent>
  </Card>
);
