import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CardHeader } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./button/button";
import { NumberField } from "./input/numberField";
import { Card, CardContent } from "./ui/card";
import { Ticket } from "lucide-react"; // <-- ADD
import { NumberBadge } from "./NumberBadge";

interface RandomProps {
  numberOfShares: number;
  onGenerate: (numbers: number[]) => void;
  selectedNumbers: Set<string>; // vendidas/reservadas
  minPurchaseShares?: number;
  maxPurchaseShares?: number;
}

const Random = ({
  onGenerate,
  numberOfShares,
  selectedNumbers,
  minPurchaseShares = 1,
  maxPurchaseShares = Number.POSITIVE_INFINITY,
}: RandomProps) => {
  const [quantityToGenerate, setQuantityToGenerate] = useState(0);
  const [randomNumbers, setRandomNumbers] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const availableCount = useMemo(() => {
    return Math.max(0, numberOfShares - selectedNumbers.size);
  }, [numberOfShares, selectedNumbers.size]);

  const effectiveMaxPurchase = useMemo(() => {
    if (!Number.isFinite(maxPurchaseShares)) return availableCount;
    return Math.min(maxPurchaseShares, availableCount);
  }, [maxPurchaseShares, availableCount]);

  const inputMax = useMemo(() => {
    return Math.max(1, Math.min(numberOfShares, effectiveMaxPurchase || 1));
  }, [numberOfShares, effectiveMaxPurchase]);

  const clampQty = (value: number) => {
    const min = Math.max(1, minPurchaseShares);
    const max = inputMax;
    return Math.max(min, Math.min(max, value));
  };

  const addQty = (delta: number) => {
    setQuantityToGenerate((prev) => clampQty((prev || 0) + delta));
  };

  useEffect(() => {
    if (randomNumbers.length === 0) return;

    if (
      Number.isFinite(maxPurchaseShares) &&
      randomNumbers.length > maxPurchaseShares
    ) {
      setError(`Quantidade máxima: ${maxPurchaseShares} cota(s).`);
    } else if (randomNumbers.length < minPurchaseShares) {
      setError(`Quantidade mínima: ${minPurchaseShares} cota(s).`);
    } else {
      setError(null);
    }
  }, [minPurchaseShares, maxPurchaseShares, randomNumbers.length]);

  const validateQuantity = (qty: number) => {
    if (qty <= 0) return "Informe a quantidade.";
    if (qty < minPurchaseShares)
      return `Quantidade mínima: ${minPurchaseShares} cota(s).`;
    if (Number.isFinite(maxPurchaseShares) && qty > maxPurchaseShares)
      return `Quantidade máxima: ${maxPurchaseShares} cota(s).`;
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
      const randomNumber = Math.floor(Math.random() * numberOfShares + 1);
      if (!selectedNumbers.has(String(randomNumber))) {
        numbers.add(randomNumber);
      }
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
    <Card>
      <CardContent>
        <CardHeader>
          <DialogTitle>Gerar cotas aleatórias</DialogTitle>
          <DialogDescription>
            Informe quantas cotas você quer gerar. Serão escolhidas apenas cotas
            disponíveis.
          </DialogDescription>
        </CardHeader>

        <div className="space-y-3">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => addQty(10)}
                title="Adicionar 10"
              >
                <Ticket className="h-4 w-4" />
                +10
              </Button>

              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => addQty(50)}
                title="Adicionar 50"
              >
                <Ticket className="h-4 w-4" />
                +50
              </Button>

              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => addQty(100)}
                title="Adicionar 100"
              >
                <Ticket className="h-4 w-4" />
                +100
              </Button>
            </div>
            <NumberField
              value={quantityToGenerate}
              onChange={(v) => setQuantityToGenerate(clampQty(v))}
              min={1}
              max={inputMax}
              step={1}
            />

            <Button onClick={handleGenerate}>Gerar</Button>
          </div>

          <div className="rounded-md bg-slate-50 border p-3 text-sm space-y-1">
            <p className="text-xs text-muted-foreground">
              Mín: {minPurchaseShares} • Máx:{" "}
              {Number.isFinite(maxPurchaseShares) ? maxPurchaseShares : "—"}
            </p>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
        </div>

        <div className="flex flex-row flex-wrap p-2 overflow-y-auto max-h-80">
          {randomNumbers.map((number, index) => (
            <NumberBadge key={index} value={number} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Random;
