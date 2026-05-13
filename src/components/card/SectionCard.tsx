import type { ComponentType, ReactNode } from "react";

import { mergeClasses } from "@/lib/mergeClasses";

type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

export const SectionCard = ({ children, className }: SectionCardProps) => (
  <div
    className={mergeClasses(
      "overflow-hidden rounded-xl border border-border bg-card shadow-sm",
      className,
    )}
  >
    {children}
  </div>
);

type SectionCardHeaderProps = {
  icon?: ComponentType<{ className?: string }>;
  title: ReactNode;
  hint?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export const SectionCardHeader = ({
  icon: Icon,
  title,
  hint,
  actions,
  className,
}: SectionCardHeaderProps) => (
  <div
    className={mergeClasses(
      "flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
      className,
    )}
  >
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-primary" />}
      <h2 className="font-semibold text-foreground">{title}</h2>
    </div>
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

type SectionCardBodyProps = {
  children: ReactNode;
  className?: string;
};

export const SectionCardBody = ({ children, className }: SectionCardBodyProps) => (
  <div className={mergeClasses("px-5 py-4", className)}>{children}</div>
);
