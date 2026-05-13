import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog/Dialog";
import { Field, FieldError, FieldLabel } from "@/components/input/base/Field";
import { Input } from "@/components/input/base/Input";
import { Textarea } from "@/components/ui/Textarea";

import type { BalanceApiDto } from "../api/dtos";
import { useRequestWithdrawal } from "../api/services/useWithdrawalService";

const formatBrl = (v: number) =>
  Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Props = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  balance: BalanceApiDto;
};

const buildSchema = (min: number, max: number) =>
  z.object({
    grossAmount: z.string().refine(
      (v) => {
        const n = Number(v);
        return !Number.isNaN(n) && n >= min && n <= max;
      },
      { message: `Informe um valor entre ${formatBrl(min)} e ${formatBrl(max)}.` },
    ),
    notes: z.string().max(500).optional(),
  });

type FormValues = { grossAmount: string; notes?: string };

export const WithdrawalRequestDialog = ({ open, onOpenChange, balance }: Props) => {
  const min = Number(balance.minimumWithdrawalAmount ?? 0);
  const max = Number(balance.available ?? 0);
  const fee = Number(balance.platformFeePercentage ?? 0);
  const { mutateAsync, isPending } = useRequestWithdrawal();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(buildSchema(min, max)),
    defaultValues: { grossAmount: String(min || 0), notes: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ grossAmount: String(Math.min(Math.max(min, 0), max)), notes: "" });
    }
  }, [open, min, max, reset]);

  const gross = Number(watch("grossAmount") ?? 0);
  const feeAmount = Number(((gross * fee) / 100).toFixed(2));
  const net = Number((gross - feeAmount).toFixed(2));

  const onSubmit = async (values: FormValues) => {
    try {
      await mutateAsync({
        grossAmount: Number(values.grossAmount),
        notes: values.notes?.trim() || undefined,
      });
      toast.success("Solicitação enviada para análise.");
      onOpenChange(false);
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string | string[] } } })
        ?.response?.data?.message;
      toast.error(
        Array.isArray(msg) ? msg.join(" · ") : msg ?? "Falha ao solicitar saque.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar saque</DialogTitle>
          <DialogDescription>
            Saldo disponível: <strong>{formatBrl(max)}</strong> · Mínimo:{" "}
            {formatBrl(min)} · Taxa: {fee.toFixed(2)}%
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Field>
            <FieldLabel htmlFor="grossAmount">Valor bruto (R$)</FieldLabel>
            <Input
              id="grossAmount"
              type="number"
              step="0.01"
              min={min}
              max={max}
              {...register("grossAmount")}
              aria-invalid={Boolean(errors.grossAmount)}
            />
            {errors.grossAmount && (
              <FieldError>{errors.grossAmount.message}</FieldError>
            )}
          </Field>

          <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Bruto solicitado</span>
              <span className="font-medium text-foreground">{formatBrl(gross)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Taxa ({fee.toFixed(2)}%)</span>
              <span className="font-medium text-amber-700">
                − {formatBrl(feeAmount)}
              </span>
            </div>
            <div className="mt-1 border-t border-border pt-1 flex items-center justify-between">
              <span className="font-semibold">Você recebe</span>
              <span className="font-semibold text-primary">{formatBrl(net)}</span>
            </div>
          </div>

          <Field>
            <FieldLabel htmlFor="notes">Observações (opcional)</FieldLabel>
            <Textarea id="notes" rows={2} {...register("notes")} />
          </Field>

          <DialogFooter>
            <div className="flex w-full items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Enviando..." : "Solicitar"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
