import { mergeClasses } from "@/lib/mergeClasses";

export type PackageCard = {
  id: string;
  quantity: number;
  tag?: string;
  title: string;
  subtitle?: string;
  highlight: string;
  description?: string;
  oldPrice?: string;
};

interface CardPackageProps {
  pkg: PackageCard;
  selected: boolean;
  price: number;
  onSelect: (quantity: number, id: string) => void;
}

const CardPackage = ({ pkg, price, selected, onSelect }: CardPackageProps) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(pkg.quantity, pkg.id)}
      className={mergeClasses(
        "relative w-full rounded-2xl border bg-white px-4 pb-5 pt-9 text-left shadow-sm transition active:scale-[0.99]",
        selected
          ? "border-green-600 ring-2 ring-green-600/20"
          : "border-gray-200 hover:border-green-600/40",
      )}
    >
      {/* Radio */}
      <span className="absolute left-4 top-4 grid h-6 w-6 place-items-center rounded-full border border-gray-300 bg-white">
        {selected ? (
          <span className="h-3.5 w-3.5 rounded-full bg-green-600" />
        ) : null}
      </span>

      {/* Tag */}
      {pkg.tag ? (
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
          {pkg.tag}
        </span>
      ) : null}

      {/* Title */}
      <h3 className="text-center text-xl font-extrabold tracking-wide text-green-700">
        {pkg.title}
      </h3>

      <p className="mt-5 text-center text-[11px] font-semibold tracking-[0.25em] text-gray-500">
        {pkg.subtitle ?? "VOCÊ RECEBE:"}
      </p>

      {/* Highlight: remove gradiente, ficar clean */}
      <div className="mx-auto mt-3 w-full max-w-[260px] rounded-full border border-green-600/25 bg-green-50 px-5 py-3 text-center text-base font-extrabold leading-snug text-green-800">
        {pkg.highlight}
      </div>

      <div className="mt-5 text-center">
        {pkg.description ? (
          <p className="text-sm text-gray-700">{pkg.description}</p>
        ) : null}

        {pkg.oldPrice ? (
          <p className="mt-3 text-sm text-gray-400 line-through">
            {pkg.oldPrice}
          </p>
        ) : null}

        {price ? (
          <p className="mt-1 text-2xl font-extrabold text-gray-900">
            R${price}
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex justify-center">
        <span
          className={mergeClasses(
            "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition",
            selected
              ? "bg-green-600 text-white"
              : "border border-gray-300 bg-white text-green-700 hover:border-green-600/50",
          )}
        >
          {selected ? "Selecionado" : `Selecionar +${pkg.quantity}`}
        </span>
      </div>
    </button>
  );
};

export default CardPackage;
