import { useEffect, useRef, useState } from "react";
import { NumberBadge, NumberBadgeProps } from "./NumberBadge";

interface QuotaGridProps extends NumberBadgeProps {
  numbers: number[] | Set<number>;
  className?: string;
  label?: string;
}

const QuotaGrid = ({ label, numbers, className, ...props }: QuotaGridProps) => {
  const list = Array.isArray(numbers) ? numbers : Array.from(numbers);
  const hasItems = list.length > 0;

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  const recompute = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setHasOverflow(el.scrollHeight > el.clientHeight + 1);
  };

  useEffect(() => {
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length]);

  if (!hasItems) return null;

  return (
    <div className={`mt-2 ${className ?? ""}`}>
      <div className="rounded-md border bg-background">
        {/* faixa à direita (não tampa conteúdo) */}
        <p className="py-2 px-2 text-xs text-slate-500">{label}</p>
        {hasOverflow && (
          <p className="px-2 text-[8px] text-muted-foreground">
            Role para ver mais
          </p>
        )}

        <div ref={scrollerRef} className="max-h-32 overflow-y-auto p-2 pr-5">
          <div className="flex flex-row flex-wrap justify-center gap-2">
            {list.map((n) => (
              <NumberBadge
                key={n}
                value={n}
                selected={props.selected}
                onClickSelect={() =>
                  props.onClickSelect != null ? String(n) : null
                }
                sold={props.sold}
                reservation={props.reservation}
              />
            ))}
          </div>
        </div>
      </div>

      {/* indicativo fora do grid (não cobre números) */}
    </div>
  );
};

export default QuotaGrid;
