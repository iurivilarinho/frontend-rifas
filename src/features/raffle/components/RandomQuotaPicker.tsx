import { useEffect, useMemo, useRef, useState } from "react";
import { CircleHelp } from "lucide-react";

import { Button } from "@/components/button/Button";
import { NumberField } from "@/components/input/NumberField";
import { PackageCard, type Package } from "./PackageCard";
import { QuotaGrid } from "./QuotaGrid";

type RandomQuotaPickerProps = {
  numberOfShares: number;
  onGenerate: (numbers: number[]) => void;
  selectedNumbers: Set<number>;
  minPurchaseShares?: number;
  maxPurchaseShares?: number;
  quotaPrice: number;
};

const PACKAGES: Package[] = [
  {
    id: "p1",
    quantity: 1,
    title: "AVULSO",
    highlight: "1 número para o sorteio",
    description: "1 número da sorte por apenas:",
  },
  {
    id: "p5",
    quantity: 5,
    title: "BÁSICO",
    highlight: "5 números para o sorteio",
    description: "1 ebooks por apenas:",
    oldPrice: "R$10,00",
  },
  {
    id: "p10",
    quantity: 10,
    title: "PLUS",
    tag: "POPULAR",
    highlight: "10 números para o sorteio",
    description: "2 ebooks por apenas:",
    oldPrice: "R$50,00",
  },
];

export const RandomQuotaPicker = ({
  numberOfShares,
  onGenerate,
  selectedNumbers,
  minPurchaseShares = 1,
  maxPurchaseShares = Number.POSITIVE_INFINITY,
  quotaPrice,
}: RandomQuotaPickerProps) => {
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [quantityToGenerate, setQuantityToGenerate] = useState(0);
  const [randomNumbers, setRandomNumbers] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const availableCount = useMemo(
    () => Math.max(0, numberOfShares - selectedNumbers.size),
    [numberOfShares, selectedNumbers.size],
  );

  const effectiveMaxPurchase = useMemo(() => {
    if (!Number.isFinite(maxPurchaseShares)) return availableCount;
    return Math.min(maxPurchaseShares, availableCount);
  }, [maxPurchaseShares, availableCount]);

  const inputMin = useMemo(
    () => Math.max(1, Math.min(minPurchaseShares, Math.max(1, availableCount))),
    [minPurchaseShares, availableCount],
  );

  const inputMax = useMemo(
    () => Math.max(1, Math.min(numberOfShares, Math.max(1, effectiveMaxPurchase))),
    [numberOfShares, effectiveMaxPurchase],
  );

  const clampQty = (value: number) => {
    const v = Number.isFinite(value) ? value : 0;
    return Math.max(inputMin, Math.min(inputMax, v));
  };

  useEffect(() => {
    if (quantityToGenerate <= 0) return;
    const next = clampQty(quantityToGenerate);
    if (next !== quantityToGenerate) setQuantityToGenerate(next);
    if (availableCount <= 0 && quantityToGenerate > 0) {
      setQuantityToGenerate(0);
      setSelectedPkgId(null);
      setRandomNumbers([]);
      setError("Não há cotas disponíveis no momento.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMin, inputMax, availableCount]);

  const ebooksForNumbers = useMemo(
    () => (quantityToGenerate > 0 ? Math.ceil(quantityToGenerate / 5) : 0),
    [quantityToGenerate],
  );

  const resetGeneratedSelection = () => {
    setRandomNumbers([]);
    setError(null);
    onGenerate([]);
  };

  const selectPackage = (qty: number, id: string) => {
    setSelectedPkgId(id);
    setQuantityToGenerate(clampQty(qty));
    resetGeneratedSelection();
  };

  const validateQuantity = (qty: number) => {
    if (availableCount <= 0) return "Não há cotas disponíveis no momento.";
    if (!Number.isFinite(qty) || qty <= 0)
      return "Selecione um pacote ou informe a quantidade de números.";
    if (qty < inputMin) return `Quantidade mínima: ${inputMin} cota(s).`;
    if (qty > inputMax) return `Quantidade máxima: ${inputMax} cota(s).`;
    if (qty > availableCount)
      return "Não há cotas disponíveis suficientes para essa quantidade.";
    return null;
  };

  const handleGenerate = () => {
    const msg = validateQuantity(quantityToGenerate);
    setError(msg);
    if (msg) return;

    const numbers = new Set<number>();
    const maxTries = numberOfShares * 10;
    let tries = 0;
    while (numbers.size < quantityToGenerate && tries < maxTries) {
      const n = Math.floor(Math.random() * numberOfShares + 1);
      if (!selectedNumbers.has(n)) numbers.add(n);
      tries += 1;
    }

    const generated = Array.from(numbers);
    if (generated.length !== quantityToGenerate) {
      setError("Não foi possível gerar a quantidade solicitada (cotas insuficientes).");
      setRandomNumbers([]);
      return;
    }

    setRandomNumbers(generated);
    onGenerate(generated);
    setError(null);

    // Aguarda o render do QuotaGrid antes de rolar até ele.
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Gerar cotas aleatórias
        </h3>
        <p className="text-xs text-muted-foreground">
          Selecione um pacote e gere as cotas disponíveis.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 items-center overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] lg:flex-row lg:flex-wrap lg:justify-center lg:items-stretch lg:overflow-visible">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="w-full max-w-[360px] lg:w-auto lg:min-w-[260px]"
            >
              <PackageCard
                pkg={pkg}
                selected={selectedPkgId === pkg.id}
                onSelect={selectPackage}
                price={pkg.quantity * quotaPrice}
              />
            </div>
          ))}
        </div>

        <div className="w-full max-w-[360px] mx-auto space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-border" />
            <span className="relative bg-background px-3 text-sm font-medium text-muted-foreground">
              OU
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex flex-row items-center gap-2">
              <CircleHelp className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground text-justify leading-relaxed">
                {quantityToGenerate > 0
                  ? `A cada 5 números = 1 ebook • Para ${quantityToGenerate} números: ${ebooksForNumbers} ebook(s).`
                  : "A cada 5 números = 1 ebook."}
              </p>
            </div>

            <NumberField
              value={quantityToGenerate}
              onChange={(v) => {
                setSelectedPkgId(null);
                const next = clampQty(v);
                setQuantityToGenerate(next);
                resetGeneratedSelection();
                setError(validateQuantity(next));
              }}
              min={inputMin}
              max={inputMax}
              step={1}
            />

            <div className="text-xs text-muted-foreground">
              Mín: {inputMin} • Máx: {inputMax}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={handleGenerate}
            className="w-full max-w-[360px]"
            disabled={availableCount <= 0}
          >
            Gerar números para sorteio
          </Button>

          {error && (
            <div className="w-full max-w-[360px] rounded-md border p-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>

      <div ref={resultRef} className="scroll-mt-20">
        <QuotaGrid numbers={randomNumbers} />
      </div>
    </div>
  );
};
