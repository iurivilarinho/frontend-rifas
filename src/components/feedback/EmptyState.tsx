import type { ComponentType, ReactNode } from "react";

import { mergeClasses } from "@/lib/mergeClasses";

type EmptyStateProps = {
  icon?: ComponentType<{ className?: string }>;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => (
  <div
    className={mergeClasses(
      "flex flex-col items-center justify-center gap-2 px-5 py-10 text-center",
      className,
    )}
  >
    {Icon && (
      <div className="rounded-full bg-muted p-3 text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
    )}
    {title && <p className="font-medium text-foreground">{title}</p>}
    {description && (
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
    )}
    {action && <div className="mt-2">{action}</div>}
  </div>
);
