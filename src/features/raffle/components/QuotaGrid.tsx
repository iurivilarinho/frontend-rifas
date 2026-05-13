import { cn } from "@/lib/mergeClasses";
import { NumberBadge } from "./NumberBadge";

type QuotaGridProps = {
  numbers: number[] | Set<number>;
  className?: string;
  label?: string;
};

export const QuotaGrid = ({ label, numbers, className }: QuotaGridProps) => {
  const list = Array.isArray(numbers) ? numbers : Array.from(numbers);
  const hasItems = list.length > 0;

  if (!hasItems) return null;

  return (
    <div className={cn("mt-3", className)}>
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border bg-muted px-3 py-2">
          <p className="text-xs font-semibold text-foreground">
            {label ?? "Números gerados"}
          </p>
          <span className="text-xs font-medium text-muted-foreground">
            {list.length}
          </span>
        </div>
        <div className="max-h-64 overflow-y-auto p-3">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
            {list.map((n) => (
              <NumberBadge key={n} value={n} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
