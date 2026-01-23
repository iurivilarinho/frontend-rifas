import React, { useEffect, useState } from "react";

interface NumberFieldProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}) => {
  const [internalValue, setInternalValue] = useState<number>(value);

  // ✅ sincroniza com o valor vindo de fora (pai)
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const clamp = (v: number) => Math.max(min, Math.min(max, v));

  const handleIncrement = () => {
    const next = clamp(internalValue + step);
    setInternalValue(next);
    onChange?.(next);
  };

  const handleDecrement = () => {
    const next = clamp(internalValue - step);
    setInternalValue(next);
    onChange?.(next);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // permite apagar e digitar de novo sem travar
    if (raw.trim() === "") {
      setInternalValue(min);
      onChange?.(min);
      return;
    }

    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;

    const next = clamp(parsed);
    setInternalValue(next);
    onChange?.(next);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={handleDecrement}
        className="w-11 h-11 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
      >
        -
      </button>

      <input
        type="number"
        value={internalValue}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        className="w-20 h-11 text-center border border-gray-300 rounded"
      />

      <button
        type="button"
        onClick={handleIncrement}
        className="w-11 h-11 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
      >
        +
      </button>
    </div>
  );
};
