import { mergeClasses } from "@/lib/mergeClasses";

type RaffleProgressBarProps = {
  porcentagem: number;
  label?: string;
  size?: "sm" | "md";
  showValue?: boolean;
  className?: string;
};

export const RaffleProgressBar = ({
  label,
  porcentagem,
  size = "md",
  showValue = false,
  className,
}: RaffleProgressBarProps) => {
  const clamped = Math.max(0, Math.min(100, porcentagem));
  const heightClass = size === "sm" ? "h-2" : "h-6";

  return (
    <div className={mergeClasses("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1 flex items-center justify-between text-xs">
          {label && <p className="font-semibold text-foreground">{label}</p>}
          {showValue && (
            <p className="font-medium text-muted-foreground">
              {clamped.toFixed(1)}%
            </p>
          )}
        </div>
      )}
      <div
        className={mergeClasses(
          "w-full overflow-hidden rounded-full bg-muted",
          heightClass,
        )}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
