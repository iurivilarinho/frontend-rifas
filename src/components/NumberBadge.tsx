export type NumberBadgeProps = {
  value?: number | string;
  digits?: number; // default: 7
  className?: string;

  // Funcionalidades opcionais do ButtonRifa
  onClickSelect?: () => void;
  selected?: boolean;
  sold?: boolean;
  reservation?: boolean;
};

export function NumberBadge({
  value,
  digits = 7,
  className = "",

  onClickSelect,
  selected = false,
  sold = false,
  reservation = false,
}: NumberBadgeProps) {
  const text = String(value).padStart(digits, "0");
  const isDisabled = sold || reservation;

  const baseClasses = [
    "flex items-center justify-center rounded border ml-1 mt-1 w-14 h-8",
    "px-1 overflow-hidden leading-none",
    onClickSelect ? "select-none" : "",
    reservation
      ? "bg-green-500 text-white cursor-not-allowed"
      : isDisabled
        ? "bg-gray-500 text-gray-200 cursor-not-allowed"
        : selected
          ? "bg-blue-500 text-white"
          : "bg-white text-black",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <span className="text-[10px] font-medium tabular-nums truncate">
      {text}
    </span>
  );

  // Se tiver click handler, vira "botão" (com disabled e onClick igual ao ButtonRifa)
  if (onClickSelect) {
    return (
      <button
        type="button"
        title={text}
        disabled={isDisabled}
        onClick={isDisabled ? undefined : onClickSelect}
        className={baseClasses}
      >
        {content}
      </button>
    );
  }

  // Caso contrário, mantém como badge normal
  return (
    <div className={baseClasses} title={text}>
      {content}
    </div>
  );
}
