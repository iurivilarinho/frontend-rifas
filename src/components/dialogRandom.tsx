import { Button } from "./button/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog/Dialog";
import { NumberField } from "./input/NumberField";
import { useEffect, useMemo, useState } from "react";

interface RandomProps {
  numberOfShares: number;
  onGenerate: (numbers: number[]) => void;
  selectedNumbers: Set<string>; // vendidas/reservadas
  minPurchaseShares?: number;
  maxPurchaseShares?: number;
}

const DialogRandom = ({
  onGenerate,
  numberOfShares,
  selectedNumbers,
  minPurchaseShares = 1,
  maxPurchaseShares = Number.POSITIVE_INFINITY,
}: RandomProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quantityToGenerate, setQuantityToGenerate] = useState(0);
  const [randomNumbers, setRandomNumbers] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const availableCount = useMemo(() => {
    // quantas cotas estão realmente disponíveis para gerar
    return Math.max(0, numberOfShares - selectedNumbers.size);
  }, [numberOfShares, selectedNumbers.size]);

  const effectiveMaxPurchase = useMemo(() => {
    // limite de compra não pode passar do disponível
    if (!Number.isFinite(maxPurchaseShares)) return availableCount;
    return Math.min(maxPurchaseShares, availableCount);
  }, [maxPurchaseShares, availableCount]);

  useEffect(() => {
    // se o usuário já tinha gerado e o estado externo mudou, revalida
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

  const clearRandomNumbers = () => {
    setQuantityToGenerate(0);
    setRandomNumbers([]);
    setError(null);
  };

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

    // safety: evita loop infinito se algo mudar
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
    setError(null);
  };

  const canConfirm = useMemo(() => {
    if (randomNumbers.length === 0) return false;
    if (randomNumbers.length < minPurchaseShares) return false;
    if (
      Number.isFinite(maxPurchaseShares) &&
      randomNumbers.length > maxPurchaseShares
    )
      return false;
    return true;
  }, [randomNumbers.length, minPurchaseShares, maxPurchaseShares]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={clearRandomNumbers} className="mb-4 w-32 h-16">
          Gerar aleatório
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar cotas aleatórias</DialogTitle>
          <DialogDescription>
            Informe quantas cotas você quer gerar. Serão escolhidas apenas cotas
            disponíveis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <NumberField
              value={quantityToGenerate}
              onChange={setQuantityToGenerate}
              min={1}
              max={Math.max(
                1,
                Math.min(numberOfShares, effectiveMaxPurchase || 1),
              )}
              step={1}
            />
            <Button onClick={handleGenerate}>Gerar</Button>
          </div>

          <div className="rounded-md bg-slate-50 border p-3 text-sm space-y-1">
            <p>
              Disponíveis:{" "}
              <span className="font-semibold">{availableCount}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Mín: {minPurchaseShares} • Máx:{" "}
              {Number.isFinite(maxPurchaseShares) ? maxPurchaseShares : "—"}
            </p>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
        </div>

        <div className="flex flex-row flex-wrap p-2 overflow-y-auto max-h-80">
          {randomNumbers.map((number, index) => (
            <div
              key={index}
              className="flex items-center justify-center rounded border ml-1 mt-1 w-8"
            >
              <p>{number}</p>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            disabled={!canConfirm}
            onClick={() => {
              onGenerate(randomNumbers);
              setIsOpen(false);
            }}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogRandom;
