import { Skeleton } from "@/components/skeleton/Skeleton";
import { mergeClasses } from "@/lib/mergeClasses";

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
  className?: string;
};

export const TableSkeleton = ({
  rows = 6,
  columns = 5,
  className,
}: TableSkeletonProps) => {
  return (
    <div className={mergeClasses("w-full", className)}>
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="grid gap-3 border-b border-border bg-muted/40 px-5 py-3"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`h-${i}`} className="h-3 w-2/3" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-3 border-b border-border px-5 py-4"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4" />
            ))}
          </div>
        ))}
      </div>
      {/* Mobile */}
      <div className="space-y-3 px-4 py-4 md:hidden">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="space-y-2 rounded-lg border border-border bg-card p-3"
          >
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
};
