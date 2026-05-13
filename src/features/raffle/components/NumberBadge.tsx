import { cn } from "@/lib/mergeClasses";

type NumberBadgeProps = {
  value?: number | string;
  digits?: number;
  className?: string;
  onClickSelect?: () => void;
  selected?: boolean;
  sold?: boolean;
  reservation?: boolean;
};

export const NumberBadge = ({
  value,
  digits = 7,
  className,
  onClickSelect,
  selected = false,
  sold = false,
  reservation = false,
}: NumberBadgeProps) => {
  const text = String(value ?? "").padStart(digits, "0");
  const isDisabled = sold || reservation;

  const stateClass = reservation
    ? "border-primary bg-primary/90 text-primary-foreground cursor-not-allowed"
    : sold
      ? "border-border bg-muted text-muted-foreground line-through cursor-not-allowed"
      : selected
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-foreground hover:bg-muted";

  const baseClass = cn(
    "inline-flex h-9 w-full items-center justify-center rounded-md border px-1 text-[11px] font-medium tabular-nums leading-none transition-colors",
    onClickSelect && "select-none",
    stateClass,
    className,
  );

  const content = <span className="truncate">{text}</span>;

  if (onClickSelect) {
    return (
      <button
        type="button"
        title={text}
        disabled={isDisabled}
        onClick={isDisabled ? undefined : onClickSelect}
        className={baseClass}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={baseClass} title={text}>
      {content}
    </div>
  );
};

export type { NumberBadgeProps };
