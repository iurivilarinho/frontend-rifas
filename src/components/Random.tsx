import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CardHeader } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./button/button";
import { CardContent } from "./ui/card";

interface RandomProps {
  numberOfShares: number;
  onGenerate: (numbers: number[]) => void;
  selectedNumbers: Set<string>; // vendidas/reservadas
  minPurchaseShares?: number;
  maxPurchaseShares?: number;
  quotaPrice: number;
}

import CardPackage, { PackageCard } from "./CardPackage";
import QuotaGrid from "./QuotaGrid";
import { NumberField } from "./input/numberField";

const PACKAGES: PackageCard[] = [
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
  {
    id: "p50",
    quantity: 50,
    title: "NITRO 2x",
    tag: "MAIS VANTAGEM",
    highlight: "50 números para o sorteio",
    description: "10 ebooks por apenas:",
    oldPrice: "R$100,00",
  },
];

const Random = (props: RandomProps) => {
  const {
    onGenerate,
    numberOfShares,
    selectedNumbers,
    minPurchaseShares = 1,
    maxPurchaseShares = Number.POSITIVE_INFINITY,
    quotaPrice,
  } = props;

  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [quantityToGenerate, setQuantityToGenerate] = useState<number>(0);
  const [randomNumbers, setRandomNumbers] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const availableCount = useMemo(
    () => Math.max(0, numberOfShares - selectedNumbers.size),
    [numberOfShares, selectedNumbers.size],
  );

  const effectiveMaxPurchase = useMemo(() => {
    if (!Number.isFinite(maxPurchaseShares)) return availableCount;
    return Math.min(maxPurchaseShares, availableCount);
  }, [maxPurchaseShares, availableCount]);

  const inputMin = useMemo(() => {
    // mínimo não pode ser menor que 1 e nem maior que o que está disponível
    return Math.max(
      1,
      Math.min(minPurchaseShares, Math.max(1, availableCount)),
    );
  }, [minPurchaseShares, availableCount]);

  const inputMax = useMemo(() => {
    // máximo respeita disponibilidade e regra de compra
    return Math.max(
      1,
      Math.min(numberOfShares, Math.max(1, effectiveMaxPurchase)),
    );
  }, [numberOfShares, effectiveMaxPurchase]);

  const clampQty = (value: number) => {
    const v = Number.isFinite(value) ? value : 0;
    const min = inputMin;
    const max = inputMax;
    return Math.max(min, Math.min(max, v));
  };

  // Se disponibilidade/limites mudarem, garante que o valor atual continue válido
  useEffect(() => {
    if (quantityToGenerate <= 0) return;
    const next = clampQty(quantityToGenerate);
    if (next !== quantityToGenerate) setQuantityToGenerate(next);
    // se ficou impossível (ex: availableCount = 0) e tinha algo selecionado, limpa
    if (availableCount <= 0 && quantityToGenerate > 0) {
      setQuantityToGenerate(0);
      setSelectedPkgId(null);
      setRandomNumbers([]);
      setError("Não há cotas disponíveis no momento.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMin, inputMax, availableCount]);

  // --- cálculo de ebooks ---
  const ebooksForNumbers = useMemo(() => {
    if (!quantityToGenerate || quantityToGenerate <= 0) return 0;
    return Math.ceil(quantityToGenerate / 5);
  }, [quantityToGenerate]);

  const selectPackage = (qty: number, id: string) => {
    setSelectedPkgId(id);
    setQuantityToGenerate(clampQty(qty));
    setRandomNumbers([]);
    setError(null);
  };

  const validateQuantity = (qty: number) => {
    if (availableCount <= 0) return "Não há cotas disponíveis no momento.";
    if (!Number.isFinite(qty) || qty <= 0)
      return "Selecione um pacote ou informe a quantidade de números.";

    if (qty < inputMin) return `Quantidade mínima: ${inputMin} cota(s).`;
    if (qty > inputMax) return `Quantidade máxima: ${inputMax} cota(s).`;

    // redundância defensiva (inputMax já considera availableCount)
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
      if (!selectedNumbers.has(String(n))) numbers.add(n);
      tries++;
    }

    const generated = Array.from(numbers);
    if (generated.length !== quantityToGenerate) {
      setError(
        "Não foi possível gerar a quantidade solicitada (cotas insuficientes).",
      );
      setRandomNumbers([]);
      return;
    }

    setRandomNumbers(generated);
    onGenerate(generated);
    setError(null);
  };

  return (
    <div>
      <CardContent>
        <CardHeader>
          <DialogTitle>Gerar cotas aleatórias</DialogTitle>
          <DialogDescription>
            Selecione um pacote e gere as cotas disponíveis.
          </DialogDescription>
        </CardHeader>

        <div className="space-y-4">
          <div
            className="
              flex flex-col gap-3
              items-center
              overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]
              lg:flex-row lg:flex-wrap lg:justify-center lg:items-stretch lg:overflow-visible
            "
          >
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className="w-full max-w-[360px] lg:w-auto lg:min-w-[260px]"
              >
                <CardPackage
                  pkg={pkg}
                  selected={selectedPkgId === pkg.id}
                  onSelect={selectPackage}
                  price={pkg.quantity * quotaPrice}
                />
              </div>
            ))}
          </div>

          <div className="w-full max-w-[360px] mx-auto space-y-4">
            {/* Divisor "OU" */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-border" />
              <span className="relative bg-background px-3 text-sm font-medium text-muted-foreground">
                OU
              </span>
            </div>

            {/* Conteúdo */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-justify">
                Se você quer um número específica de numeros para participar do
                nosso sorteio sobre o produto, veja quantos ebooks comprar.
              </p>

              <p className="text-xs text-muted-foreground text-justify leading-relaxed">
                {quantityToGenerate > 0
                  ? `A cada 5 números = 1 ebook • Para ${quantityToGenerate} números: ${ebooksForNumbers} ebook(s).`
                  : "A cada 5 números = 1 ebook."}
              </p>

              <NumberField
                value={quantityToGenerate}
                onChange={(v) => {
                  setSelectedPkgId(null);
                  setRandomNumbers([]);

                  const next = clampQty(v);
                  setQuantityToGenerate(next);

                  // valida e mostra mensagem imediatamente quando a pessoa digita
                  const msg = validateQuantity(next);
                  setError(msg);
                }}
                min={inputMin}
                max={inputMax}
                step={1}
              />

              {/* feedback de limites (opcional, mas ajuda o usuário) */}
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

        <QuotaGrid numbers={randomNumbers} />
      </CardContent>
    </div>
  );
};

export default Random;
