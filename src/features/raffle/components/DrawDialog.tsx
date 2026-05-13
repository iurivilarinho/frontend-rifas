import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

import { Button } from "@/components/button/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
      <DialogContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-700" />
            <h2 className="text-lg font-semibold text-gray-900">
              Sortear · {raffleTitle}
            </h2>
          </div>

          {!result ? (
            <>
              <p className="text-sm text-gray-600">
                O sorteio escolhe aleatoriamente entre as cotas pagas. Após o sorteio,
                a rifa entra no status <strong>Sorteada</strong>.
              </p>

              <Field>
                <FieldLabel htmlFor="winnersCount">Quantidade de ganhadores</FieldLabel>
                <Input
                  id="winnersCount"
                  type="number"
                  min={1}
                  max={100}
                  value={winnersCount}
                  onChange={(e) => setWinnersCount(Math.max(1, Number(e.target.value)))}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="notes">Observações (opcional)</FieldLabel>
                <Input
                  id="notes"
                  placeholder="Ex.: Sorteio ao vivo no Instagram."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Field>

              <DialogFooter>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleDraw} disabled={isPending}>
                  {isPending ? "Sorteando..." : "Sortear agora"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm text-green-900">
                  Sorteio realizado em {new Date(result.createdAt).toLocaleString("pt-BR")}.
                  Seed: <code className="text-xs">{result.seed}</code>
                </p>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-900">
                  Cota(s) ganhadora(s):
                </p>
                <div className="space-y-2">
                  {result.winners.map((w) => (
                    <div
                      key={w.quotaId}
                      className="rounded-md border border-green-100 bg-white p-3"
                    >
                      <p className="text-sm font-semibold text-green-700">
                        Cota nº {String(w.quotaNumber).padStart(7, "0")}
                      </p>
                      {w.buyerName && (
                        <div className="mt-1 text-xs text-gray-700">
                          <p>{w.buyerName}</p>
                          {w.buyerCpf && <p>{w.buyerCpf}</p>}
                          {w.buyerEmail && <p>{w.buyerEmail}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => onOpenChange(false)}>Fechar</Button>
              </DialogFooter>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
