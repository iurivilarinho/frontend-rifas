import BuyerForm, {
  userFormSchema,
  UserFormType,
} from "@/pages/buyer/buyerForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./button/button";
import PaymentCard from "./PaymentCard";
import { ShoppingCart } from "lucide-react";
import {
  DialogFooter,
  DialogTrigger,
  Dialog,
  DialogContent,
} from "./dialog/Dialog";
import { Step, StepLabel, Stepper } from "@mui/material";
import { DialogTitle } from "@radix-ui/react-dialog";

type StepType = "buyer" | "payment";

const stepOrder: StepType[] = ["buyer", "payment"];

const stepLabel: Record<StepType, string> = {
  buyer: "Identificar Comprador",
  payment: "Opções de Pagamento",
};

interface MultiStepProps {
  totalPrice: number;
  quotesSelected: Set<number>;
  disableButton: boolean;
  raffleId: number;
  showButtonBuy: boolean;
}

const MultiStepForm = ({
  raffleId,
  quotesSelected,
  totalPrice,
  disableButton,
  showButtonBuy,
}: MultiStepProps) => {
  const [step, setStep] = useState<StepType>("buyer");
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<UserFormType | null>(null);

  const activeStepIndex = useMemo(() => stepOrder.indexOf(step), [step]);

  const methods = useForm<UserFormType>({
    resolver: zodResolver(userFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      cpf: "",
      numberPhone: "",
    },
  });

  const goNext = (next: StepType) => setStep(next);

  const goBack = () => {
    const idx = stepOrder.indexOf(step);
    if (idx <= 0) return;
    setStep(stepOrder[idx - 1]);
  };

  const handleNextFromBuyer = (data: UserFormType) => {
    setUserData(data);
    goNext("payment");
  };

  const getStepContent = (current: StepType) => {
    switch (current) {
      case "buyer":
        return <BuyerForm form={methods} />;
      case "payment":
        return (
          <PaymentCard
            totalPrice={totalPrice}
            quotesSelected={quotesSelected}
            raffleId={raffleId}
            userData={userData}
          />
        );
      default:
        return null;
    }
  };

  const isNextDisabled = step === "buyer" ? !methods.formState.isValid : false;

  const handleNextClick = async () => {
    const ok = await methods.trigger();
    if (!ok) return;

    const data = methods.getValues();
    handleNextFromBuyer(data);
  };

  return (
    <div>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setStep("buyer");
            setUserData(null);
            methods.reset();
          }
        }}
      >
        <DialogTrigger asChild>
          {showButtonBuy && (
            <Button
              disabled={disableButton}
              onClick={() => setIsOpen(true)}
              className="mb-4 w-full h-10 gap-2"
            >
              <ShoppingCart />
              Reservar
            </Button>
          )}
        </DialogTrigger>

        <DialogContent
          className="

    w-full p-0
    flex flex-col
    h-[85dvh] max-h-[85dvh]
    overflow-hidden
  "
        >
          {/* Header */}
          <div className="shrink-0 px-4 py-4 sm:px-6 border-b bg-background bg">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-sm text-muted-foreground">
                  Finalizar reserva
                </DialogTitle>
                <h2 className="text-base sm:text-lg font-semibold leading-tight">
                  {stepLabel[step]}
                </h2>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {activeStepIndex + 1}/{stepOrder.length}
              </div>
            </div>

            <div className="mt-4">
              <Stepper
                activeStep={activeStepIndex}
                sx={{
                  "& .MuiStepLabel-label": { fontSize: 12 },
                  "& .MuiStepIcon-root": { width: 22, height: 22 },
                }}
              >
                {stepOrder.map((key) => (
                  <Step key={key}>
                    <StepLabel>{stepLabel[key]}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </div>
          </div>

          {/* Body (rola) */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6">
            {getStepContent(step)}
          </div>

          {/* Footer (fixo e sempre visível) */}
          <DialogFooter
            className="
      shrink-0
      px-4 py-4 sm:px-6
      border-t bg-background
      pb-[calc(env(safe-area-inset-bottom)+16px)]
    "
          >
            <div className="flex justify-between w-full">
              <Button disabled={step === "buyer"} onClick={goBack}>
                Voltar
              </Button>

              {step === "buyer" ? (
                <Button disabled={isNextDisabled} onClick={handleNextClick}>
                  Próximo
                </Button>
              ) : (
                <Button onClick={() => setIsOpen(false)}>Fechar</Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MultiStepForm;
