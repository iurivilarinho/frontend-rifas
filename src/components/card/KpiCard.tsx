import type { ComponentType, ReactNode } from "react";

import { Skeleton } from "@/components/skeleton/Skeleton";
import { mergeClasses } from "@/lib/mergeClasses";

type KpiCardProps = {
  icon: ComponentType<{ className?: string }>;
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
  isLoading?: boolean;
};

export const KpiCard = ({
  icon: Icon,
  label,
  value,
  hint,
  className,
  isLoading,
}: KpiCardProps) => (
  <div
    className={mergeClasses(
      "rounded-xl border border-border bg-card p-5 shadow-sm",
      className,
    )}
  >
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        {isLoading ? (
          <Skeleton className="mt-2 h-7 w-24" />
        ) : (
          <p className="mt-1 truncate text-2xl font-semibold text-foreground">{value}</p>
        )}
        {isLoading ? (
          <Skeleton className="mt-2 h-3 w-32" />
        ) : (
          hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    </div>
  </div>
);

export const KpiCardSkeleton = ({ className }: { className?: string }) => (
  <div
    className={mergeClasses(
      "rounded-xl border border-border bg-card p-5 shadow-sm",
      className,
    )}
  >
    <div className="flex items-start gap-3">
      <Skeleton className="h-9 w-9 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  </div>
);
