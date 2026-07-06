import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/button/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/dialog/Dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { NumberField } from "@/components/input/NumberField";
import { PackageCard, type Package } from "./PackageCard";

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
  const [error, setError] = useState<string | null>(null);
  const [qtyOpen, setQtyOpen] = useState(false);

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
      onGenerate([]);
      setError("Não há cotas disponíveis no momento.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMin, inputMax, availableCount]);

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

  const generateNumbersFor = (qty: number): boolean => {
    const msg = validateQuantity(qty);
    setError(msg);
    if (msg) return false;

    const numbers = new Set<number>();
    const maxTries = numberOfShares * 10;
    let tries = 0;
    while (numbers.size < qty && tries < maxTries) {
      const n = Math.floor(Math.random() * numberOfShares + 1);
      if (!selectedNumbers.has(n)) numbers.add(n);
      tries += 1;
    }

    const generated = Array.from(numbers);
    if (generated.length !== qty) {
      setError("Não foi possível gerar a quantidade solicitada (cotas insuficientes).");
      onGenerate([]);
      return false;
    }

    onGenerate(generated); // os números aparecem no painel "Reserve sua cota"
    setError(null);
    return true;
  };

  // Ao escolher um pacote, já gera os números na hora (menos um passo).
  const selectPackage = (qty: number, id: string) => {
    const clamped = clampQty(qty);
    setSelectedPkgId(id);
    setQuantityToGenerate(clamped);
    generateNumbersFor(clamped);
  };

  // Quantidade manual (dentro do popup).
  const handleQuantityChange = (v: number) => {
    setSelectedPkgId(null);
    const next = clampQty(v);
    setQuantityToGenerate(next);
    onGenerate([]);
    setError(validateQuantity(next));
  };

  const handleGenerateManual = () => {
    if (generateNumbersFor(quantityToGenerate)) setQtyOpen(false);
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

        {/* Quem quiser outra quantidade abre este popup (não polui a página) */}
        <div className="flex justify-center">
          <Dialog open={qtyOpen} onOpenChange={setQtyOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full max-w-[360px]"
                disabled={availableCount <= 0}
              >
                Ou informar outra quantidade
              </Button>
            </DialogTrigger>

            <DialogContent className="flex w-full flex-col overflow-hidden p-0 sm:max-w-md">
              <header className="border-b border-border px-4 pt-4 pb-3 sm:px-6 sm:pt-5">
                <DialogTitle className="text-lg font-semibold leading-tight text-foreground">
                  Informar quantidade
                </DialogTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Escolha quantos números você quer gerar.
                </p>
              </header>

              <div className="space-y-3 px-4 py-4 sm:px-6">
                <NumberField
                  value={quantityToGenerate}
                  onChange={handleQuantityChange}
                  min={inputMin}
                  max={inputMax}
                  step={1}
                />
                {error && (
                  <div className="rounded-md border p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}
              </div>

              <DialogFooter className="border-t border-border px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] sm:px-6 sm:py-4">
                <Button
                  className="w-full"
                  disabled={availableCount <= 0}
                  onClick={handleGenerateManual}
                >
                  Gerar meus números
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {error && !qtyOpen && (
          <div className="w-full max-w-[360px] mx-auto rounded-md border p-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
