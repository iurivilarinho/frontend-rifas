import type { ComponentType, ReactNode } from "react";

import { mergeClasses } from "@/lib/mergeClasses";

export type FilterPillOption<TValue extends string> = {
  value: TValue;
  label: ReactNode;
  icon?: ComponentType<{ className?: string }>;
};

type FilterPillsProps<TValue extends string> = {
  options: ReadonlyArray<FilterPillOption<TValue>>;
  value: TValue;
  onChange: (value: TValue) => void;
  className?: string;
  size?: "sm" | "md";
};

export const FilterPills = <TValue extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: FilterPillsProps<TValue>) => {
  const sizeClass =
    size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm";

  return (
    <nav className={mergeClasses("flex flex-wrap gap-2", className)}>
      {options.map(({ value: optValue, label, icon: Icon }) => {
        const active = value === optValue;
        return (
          <button
            key={optValue}
            type="button"
            onClick={() => onChange(optValue)}
            className={mergeClasses(
              "inline-flex items-center gap-2 rounded-full border font-medium transition-colors",
              sizeClass,
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-muted",
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {label}
          </button>
        );
      })}
    </nav>
  );
};
