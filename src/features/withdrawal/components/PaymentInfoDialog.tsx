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

import type {
  BankAccountType,
  PaymentMethodType,
  PixKeyType,
  UserPaymentInfoApiDto,
} from "../api/dtos";
import {
  useGetMyPaymentInfo,
  useUpsertMyPaymentInfo,
} from "../api/services/useWithdrawalService";

const schema = z
  .object({
    type: z.enum(["PIX", "BANK_ACCOUNT"]),
    pixKey: z.string().optional(),
    pixKeyType: z.enum(["CPF", "CNPJ", "EMAIL", "PHONE", "RANDOM"]).optional(),
    bankCode: z.string().optional(),
    bankName: z.string().optional(),
    agency: z.string().optional(),
    accountNumber: z.string().optional(),
    accountType: z.enum(["CHECKING", "SAVINGS"]).optional(),
    holderName: z.string().min(1, "Nome do titular é obrigatório."),
    holderDocument: z.string().min(1, "Documento do titular é obrigatório."),
  })
  .superRefine((data, ctx) => {
    if (data.type === "PIX") {
      if (!data.pixKey?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["pixKey"],
          message: "Chave Pix obrigatória.",
        });
      }
      if (!data.pixKeyType) {
        ctx.addIssue({
          code: "custom",
          path: ["pixKeyType"],
          message: "Tipo da chave obrigatório.",
        });
      }
    } else {
      if (!data.bankName?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["bankName"],
          message: "Banco obrigatório.",
        });
      }
      if (!data.agency?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["agency"],
          message: "Agência obrigatória.",
        });
      }
      if (!data.accountNumber?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["accountNumber"],
          message: "Conta obrigatória.",
        });
      }
      if (!data.accountType) {
        ctx.addIssue({
          code: "custom",
          path: ["accountType"],
          message: "Tipo de conta obrigatório.",
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

const DEFAULTS: FormValues = {
  type: "PIX",
  holderName: "",
  holderDocument: "",
};

type Props = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
};

const toForm = (data: UserPaymentInfoApiDto | null | undefined): FormValues => {
  if (!data) return DEFAULTS;
  return {
    type: (data.type ?? "PIX") as PaymentMethodType,
    pixKey: data.pixKey ?? "",
    pixKeyType: (data.pixKeyType ?? undefined) as PixKeyType | undefined,
    bankCode: data.bankCode ?? "",
    bankName: data.bankName ?? "",
    agency: data.agency ?? "",
    accountNumber: data.accountNumber ?? "",
    accountType: (data.accountType ?? undefined) as BankAccountType | undefined,
    holderName: data.holderName ?? "",
    holderDocument: data.holderDocument ?? "",
  };
};

export const PaymentInfoDialog = ({ open, onOpenChange }: Props) => {
  const { data } = useGetMyPaymentInfo();
  const { mutateAsync, isPending } = useUpsertMyPaymentInfo();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (open) reset(toForm(data));
  }, [open, data, reset]);

  const type = watch("type");

  const onSubmit = async (values: FormValues) => {
    try {
      await mutateAsync(values);
      toast.success("Dados de recebimento salvos.");
      onOpenChange(false);
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string | string[] } } })
        ?.response?.data?.message;
      toast.error(
        Array.isArray(msg) ? msg.join(" · ") : msg ?? "Falha ao salvar.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100vw-2rem)] overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dados de recebimento</DialogTitle>
          <DialogDescription>
            Configure como você quer receber os saques.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex max-h-[70dvh] min-w-0 flex-col gap-3 overflow-y-auto"
        >
          <Field className="min-w-0">
            <FieldLabel htmlFor="type">Forma de recebimento</FieldLabel>
            <select
              id="type"
              {...register("type")}
              className="h-9 w-full min-w-0 rounded-md border border-border bg-card px-3 text-sm text-foreground"
            >
              <option value="PIX">Pix</option>
              <option value="BANK_ACCOUNT">Conta bancária</option>
            </select>
          </Field>

          {type === "PIX" ? (
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
              <Field className="min-w-0 sm:col-span-2">
                <FieldLabel htmlFor="pixKey">Chave Pix</FieldLabel>
                <Input
                  id="pixKey"
                  className="w-full min-w-0"
                  {...register("pixKey")}
                  aria-invalid={Boolean(errors.pixKey)}
                />
                {errors.pixKey && <FieldError>{errors.pixKey.message}</FieldError>}
              </Field>
              <Field className="min-w-0">
                <FieldLabel htmlFor="pixKeyType">Tipo</FieldLabel>
                <select
                  id="pixKeyType"
                  {...register("pixKeyType")}
                  className="h-9 w-full min-w-0 rounded-md border border-border bg-card px-3 text-sm text-foreground"
                >
                  <option value="">Selecione</option>
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="EMAIL">E-mail</option>
                  <option value="PHONE">Celular</option>
                  <option value="RANDOM">Aleatória</option>
                </select>
                {errors.pixKeyType && (
                  <FieldError>{errors.pixKeyType.message}</FieldError>
                )}
              </Field>
            </div>
          ) : (
            <>
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-4">
                <Field className="min-w-0 sm:col-span-1">
                  <FieldLabel htmlFor="bankCode">Cód.</FieldLabel>
                  <Input
                    id="bankCode"
                    className="w-full min-w-0"
                    {...register("bankCode")}
                  />
                </Field>
                <Field className="min-w-0 sm:col-span-3">
                  <FieldLabel htmlFor="bankName">Banco</FieldLabel>
                  <Input
                    id="bankName"
                    className="w-full min-w-0"
                    {...register("bankName")}
                    aria-invalid={Boolean(errors.bankName)}
                  />
                  {errors.bankName && (
                    <FieldError>{errors.bankName.message}</FieldError>
                  )}
                </Field>
              </div>
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-6">
                <Field className="min-w-0 sm:col-span-2">
                  <FieldLabel htmlFor="agency">Agência</FieldLabel>
                  <Input
                    id="agency"
                    className="w-full min-w-0"
                    {...register("agency")}
                    aria-invalid={Boolean(errors.agency)}
                  />
                  {errors.agency && (
                    <FieldError>{errors.agency.message}</FieldError>
                  )}
                </Field>
                <Field className="min-w-0 sm:col-span-2">
                  <FieldLabel htmlFor="accountNumber">Conta com dígito</FieldLabel>
                  <Input
                    id="accountNumber"
                    className="w-full min-w-0"
                    {...register("accountNumber")}
                    aria-invalid={Boolean(errors.accountNumber)}
                  />
                  {errors.accountNumber && (
                    <FieldError>{errors.accountNumber.message}</FieldError>
                  )}
                </Field>
                <Field className="min-w-0 sm:col-span-2">
                  <FieldLabel htmlFor="accountType">Tipo</FieldLabel>
                  <select
                    id="accountType"
                    {...register("accountType")}
                    className="h-9 w-full min-w-0 rounded-md border border-border bg-card px-3 text-sm text-foreground"
                  >
                    <option value="">Selecione</option>
                    <option value="CHECKING">Corrente</option>
                    <option value="SAVINGS">Poupança</option>
                  </select>
                  {errors.accountType && (
                    <FieldError>{errors.accountType.message}</FieldError>
                  )}
                </Field>
              </div>
            </>
          )}

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
            <Field className="min-w-0">
              <FieldLabel htmlFor="holderName">Nome do titular</FieldLabel>
              <Input
                id="holderName"
                className="w-full min-w-0"
                {...register("holderName")}
                aria-invalid={Boolean(errors.holderName)}
              />
              {errors.holderName && (
                <FieldError>{errors.holderName.message}</FieldError>
              )}
            </Field>
            <Field className="min-w-0">
              <FieldLabel htmlFor="holderDocument">CPF/CNPJ do titular</FieldLabel>
              <Input
                id="holderDocument"
                className="w-full min-w-0"
                {...register("holderDocument")}
                aria-invalid={Boolean(errors.holderDocument)}
              />
              {errors.holderDocument && (
                <FieldError>{errors.holderDocument.message}</FieldError>
              )}
            </Field>
          </div>

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
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
