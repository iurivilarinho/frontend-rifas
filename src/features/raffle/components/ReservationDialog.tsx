import { useMemo, useState } from "react";
import { Check, CreditCard, ShoppingCart, User } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/button/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/dialog/Dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { mergeClasses } from "@/lib/mergeClasses";

import { BuyerForm } from "./BuyerForm";
import { PaymentCard } from "./PaymentCard";

const buyerFormSchema = z.object({
  fullName: z.string().min(1, { error: "O nome completo é obrigatório!" }),
  email: z.email("Formato de email inválido!"),
  cpf: z
    .string()
    .refine((v) => v.replace(/\D/g, "").length === 11, { message: "CPF incompleto!" }),
  numberPhone: z.string().refine(
    (v) => {
      const len = v.replace(/\D/g, "").length;
      return len === 10 || len === 11;
    },
    { message: "Telefone inválido!" },
  ),
});

export type BuyerFormValues = z.infer<typeof buyerFormSchema>;

const DEFAULT_BUYER_FORM_VALUES: BuyerFormValues = {
  fullName: "",
  email: "",
  cpf: "",
  numberPhone: "",
};

type ReservationDialogProps = {
  totalPrice: number;
  quotesSelected: Set<number>;
  disableButton: boolean;
  raffleId: number;
  showButtonBuy: boolean;
};

type StepType = "buyer" | "payment";

type StepConfig = {
  key: StepType;
  label: string;
  shortLabel: string;
  icon: typeof User;
};

const STEPS: StepConfig[] = [
  { key: "buyer", label: "Identificar comprador", shortLabel: "Comprador", icon: User },
  { key: "payment", label: "Opções de pagamento", shortLabel: "Pagamento", icon: CreditCard },
];

const stepOrder: StepType[] = STEPS.map((s) => s.key);

export const ReservationDialog = ({
  totalPrice,
  quotesSelected,
  disableButton,
  raffleId,
  showButtonBuy,
}: ReservationDialogProps) => {
  const [step, setStep] = useState<StepType>("buyer");
  const [isOpen, setIsOpen] = useState(false);
  const [buyerData, setBuyerData] = useState<BuyerFormValues | null>(null);

  const activeStepIndex = useMemo(() => stepOrder.indexOf(step), [step]);

  const methods = useForm<BuyerFormValues>({
    resolver: zodResolver(buyerFormSchema),
    mode: "onChange",
    defaultValues: DEFAULT_BUYER_FORM_VALUES,
  });

  const goBack = () => {
    const idx = stepOrder.indexOf(step);
    if (idx <= 0) return;
    setStep(stepOrder[idx - 1]);
  };

  const handleNextClick = async () => {
    const ok = await methods.trigger();
    if (!ok) return;
    const data = methods.getValues();
    setBuyerData(data);
    setStep("payment");
  };

  const isNextDisabled = step === "buyer" ? !methods.formState.isValid : false;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setStep("buyer");
          setBuyerData(null);
          methods.reset(DEFAULT_BUYER_FORM_VALUES);
        }
      }}
    >
      <DialogTrigger asChild>
        {showButtonBuy ? (
          <Button
            disabled={disableButton}
            onClick={() => setIsOpen(true)}
            className="mb-4 w-full h-10 gap-2"
          >
            <ShoppingCart />
            Reservar
          </Button>
        ) : null}
      </DialogTrigger>

      <DialogContent className="flex max-h-[88dvh] w-full flex-col overflow-hidden p-0 sm:max-w-3xl lg:max-w-4xl">
        <header className="shrink-0 border-b border-border bg-card px-4 pt-4 pb-3 sm:px-6 sm:pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Finalizar reserva
          </p>
          <DialogTitle className="mt-0.5 text-lg font-semibold leading-tight text-foreground sm:text-xl">
            {STEPS[activeStepIndex]?.label}
          </DialogTitle>

          {/* Stepper */}
          <ol className="mt-4 flex items-center gap-2">
            {STEPS.map((s, idx) => {
              const isDone = idx < activeStepIndex;
              const isActive = idx === activeStepIndex;
              const StepIcon = s.icon;
              return (
                <li key={s.key} className="flex flex-1 items-center gap-2">
                  <div
                    className={mergeClasses(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                      isDone
                        ? "border-primary bg-primary text-primary-foreground"
                        : isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : <StepIcon className="h-3.5 w-3.5" />}
                  </div>
                  <span
                    className={mergeClasses(
                      "hidden text-xs font-medium sm:inline",
                      isActive
                        ? "text-foreground"
                        : isDone
                          ? "text-foreground/80"
                          : "text-muted-foreground",
                    )}
                  >
                    {s.shortLabel}
                  </span>
                  {idx < STEPS.length - 1 && (
                    <span
                      aria-hidden
                      className={mergeClasses(
                        "h-px flex-1 transition-colors",
                        isDone ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <FormProvider {...methods}>
            {step === "buyer" && <BuyerForm />}
            {step === "payment" && (
              <PaymentCard
                totalPrice={totalPrice}
                quotesSelected={quotesSelected}
                raffleId={raffleId}
                userData={buyerData}
              />
            )}
          </FormProvider>
        </div>

        <DialogFooter className="shrink-0 border-t border-border bg-card px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] sm:px-6 sm:py-4">
          <div className="flex w-full flex-row items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={step === "buyer"}
              onClick={goBack}
            >
              Voltar
            </Button>
            {step === "buyer" ? (
              <Button
                type="button"
                disabled={isNextDisabled}
                onClick={handleNextClick}
              >
                Próximo
              </Button>
            ) : (
              <Button type="button" onClick={() => setIsOpen(false)}>
                Fechar
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
