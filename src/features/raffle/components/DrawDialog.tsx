import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

import { Button } from "@/components/button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog/Dialog";
import { Field, FieldLabel } from "@/components/input/base/Field";
import { Input } from "@/components/input/base/Input";
import {
  usePerformDraw,
  type RaffleDrawApiDto,
} from "../api/services/useRaffleService";

type DrawDialogProps = {
  raffleId: number;
  raffleTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const DrawDialog = ({ raffleId, raffleTitle, open, onOpenChange }: DrawDialogProps) => {
  const [winnersCount, setWinnersCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<RaffleDrawApiDto | null>(null);

  const { mutateAsync: performDraw, isPending } = usePerformDraw();

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setResult(null);
        setWinnersCount(1);
        setNotes("");
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleDraw = async () => {
    const drawResult = await performDraw({ raffleId, winnersCount, notes });
    setResult(drawResult);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="inline-flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Sortear · {raffleTitle}
          </DialogTitle>
          {!result && (
            <DialogDescription>
              O sorteio escolhe aleatoriamente entre as cotas pagas. Após o sorteio, a
              rifa entra no status <strong>Sorteada</strong>.
            </DialogDescription>
          )}
        </DialogHeader>

        {!result ? (
          <div className="space-y-3">
            <Field className="min-w-0">
              <FieldLabel htmlFor="winnersCount">Quantidade de ganhadores</FieldLabel>
              <Input
                id="winnersCount"
                type="number"
                min={1}
                max={100}
                className="w-full min-w-0"
                value={winnersCount}
                onChange={(e) => setWinnersCount(Math.max(1, Number(e.target.value)))}
              />
            </Field>

            <Field className="min-w-0">
              <FieldLabel htmlFor="notes">Observações (opcional)</FieldLabel>
              <Input
                id="notes"
                placeholder="Ex.: Sorteio ao vivo no Instagram."
                className="w-full min-w-0"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>

            <DialogFooter>
              <div className="flex w-full items-center justify-between gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleDraw} disabled={isPending}>
                  {isPending ? "Sorteando..." : "Sortear agora"}
                </Button>
              </div>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
              <p className="text-foreground">
                Sorteio realizado em{" "}
                {new Date(result.createdAt).toLocaleString("pt-BR")}.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Seed: <code className="text-xs">{result.seed}</code>
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">
                Cota(s) ganhadora(s):
              </p>
              <ul className="space-y-2">
                {result.winners.map((w) => (
                  <li
                    key={w.quotaId}
                    className="rounded-md border border-border bg-card p-3"
                  >
                    <p className="text-sm font-semibold text-primary">
                      Cota nº {String(w.quotaNumber).padStart(7, "0")}
                    </p>
                    {w.buyerName && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        <p className="text-foreground">{w.buyerName}</p>
                        {w.buyerCpf && <p>{w.buyerCpf}</p>}
                        {w.buyerEmail && <p>{w.buyerEmail}</p>}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Fechar</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
