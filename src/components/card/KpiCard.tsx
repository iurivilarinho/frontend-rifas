import type { ComponentType, ReactNode } from "react";

import { mergeClasses } from "@/lib/mergeClasses";

type KpiCardProps = {
  icon: ComponentType<{ className?: string }>;
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
};

export const KpiCard = ({ icon: Icon, label, value, hint, className }: KpiCardProps) => (
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
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  </div>
);
