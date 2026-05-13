import { cn } from "@/lib/mergeClasses";

export type Package = {
  id: string;
  quantity: number;
  tag?: string;
  title: string;
  subtitle?: string;
  highlight: string;
  description?: string;
  oldPrice?: string;
};

type PackageCardProps = {
  pkg: Package;
  selected: boolean;
  price: number;
  onSelect: (quantity: number, id: string) => void;
  className?: string;
};

export const PackageCard = ({
  pkg,
  price,
  selected,
  onSelect,
  className,
}: PackageCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(pkg.quantity, pkg.id)}
      className={cn(
        "relative w-full rounded-2xl border bg-card px-4 pb-5 pt-9 text-left shadow-sm transition active:scale-[0.99]",
        selected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-primary/40",
        className,
      )}
    >
      <span className="absolute left-4 top-4 grid h-6 w-6 place-items-center rounded-full border border-border bg-card">
        {selected ? <span className="h-3.5 w-3.5 rounded-full bg-primary" /> : null}
      </span>

      {pkg.tag && (
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground shadow-sm">
          {pkg.tag}
        </span>
      )}

      <h3 className="text-center text-xl font-extrabold tracking-wide text-primary">
        {pkg.title}
      </h3>

      <p className="mt-5 text-center text-[11px] font-semibold tracking-[0.25em] text-muted-foreground">
        {pkg.subtitle ?? "VOCÊ RECEBE:"}
      </p>

      <div className="mx-auto mt-3 w-full max-w-[260px] rounded-full border border-primary/25 bg-primary/10 px-5 py-3 text-center text-base font-extrabold leading-snug text-primary">
        {pkg.highlight}
      </div>

      <div className="mt-5 text-center">
        {pkg.description && (
          <p className="text-sm text-foreground">{pkg.description}</p>
        )}
        {pkg.oldPrice && (
          <p className="mt-3 text-sm text-muted-foreground line-through">
            {pkg.oldPrice}
          </p>
        )}
        {price > 0 && (
          <p className="mt-1 text-2xl font-extrabold text-foreground">
            {price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        )}
      </div>

      <div className="mt-5 flex justify-center">
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition",
            selected
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-primary hover:border-primary/50",
          )}
        >
          {selected ? "Selecionado" : `Selecionar +${pkg.quantity}`}
        </span>
      </div>
    </button>
  );
};
