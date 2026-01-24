import { NumberBadge, NumberBadgeProps } from "./NumberBadge";

interface QuotaGridProps extends NumberBadgeProps {
  numbers: number[];
}

const QuotaGrid = ({ numbers, ...props }: QuotaGridProps) => {
  return (
    <div className="flex flex-row flex-wrap p-2 overflow-y-auto max-h-80">
      {numbers.map((n, i) => (
        <NumberBadge
          key={i}
          value={n}
          selected={props.selected}
          onClickSelect={() => (props.onClickSelect != null ? String(n) : null)}
          sold={props.sold}
          reservation={props.reservation}
        />
      ))}
    </div>
  );
};

export default QuotaGrid;
