import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/mergeClasses";

type ThemeToggleProps = {
  className?: string;
  label?: string;
  description?: string;
  compact?: boolean;
  iconOnly?: boolean;
};

export const ThemeToggle = ({
  className,
  label = "Tema escuro",
  description,
  compact = false,
  iconOnly = false,
}: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const isDark = mounted && resolvedTheme === "dark";
  const ThemeIcon = isDark ? Moon : Sun;

  if (iconOnly) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={label}
        title={label}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={cn(
          "flex size-8 items-center justify-center rounded-xl border border-[color:var(--brand-border)] bg-[color:var(--brand-surface)] text-[color:var(--brand-ink)] transition-colors hover:bg-[color:var(--brand-shell)]",
          className,
        )}
      >
        <ThemeIcon className={cn("h-4 w-4", !isDark && "text-amber-500")} />
      </button>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border border-[color:var(--brand-border)] bg-[color:var(--brand-surface)] px-3 py-3 text-left transition-colors hover:bg-[color:var(--brand-shell)]",
        compact && "gap-2 px-2.5 py-2.5",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-semibold text-[color:var(--brand-ink)]",
            compact && "text-xs",
          )}
        >
          {label}
        </p>
        {description ? (
          <p
            className={cn(
              "mt-1 text-xs text-[color:var(--brand-muted)]",
              compact && "mt-0.5 text-[11px]",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          "relative flex h-8 w-16 shrink-0 items-center rounded-full border border-[color:var(--brand-border)] bg-[color:var(--brand-shell)] px-1 transition-colors",
          isDark && "bg-[color:var(--brand-ink)]/12",
          compact && "h-7 w-14",
        )}
      >
        <Sun
          className={cn(
            "z-10 h-4 w-4 text-amber-500 transition-opacity",
            compact && "h-3.5 w-3.5",
            isDark && "opacity-55",
          )}
        />
        <Moon
          className={cn(
            "z-10 ml-auto h-4 w-4 text-[color:var(--brand-muted)] transition-opacity",
            compact && "h-3.5 w-3.5",
            !isDark && "opacity-55",
          )}
        />
        <span
          className={cn(
            "absolute left-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[color:var(--brand-surface)] shadow-sm transition-transform",
            isDark && "translate-x-8",
            compact && "h-5 w-5",
            compact && isDark && "translate-x-7",
          )}
        />
      </div>
    </button>
  );
};
