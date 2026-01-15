import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import UserForm from "@/pages/usuario/usuarioForm";
import { UserFormType, userFormSchema } from "@/types/usuario";
import { zodResolver } from "@hookform/resolvers/zod";
import { Step, StepLabel, Stepper } from "@mui/material";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "./button/button";
import PaymentCard from "./PaymentCard";

// Importe o schema de validação

const steps = ["Identificar Comprador", "Opções de Pagamento"];

interface MultiStepProps {
  totalPrice: number;
  quotesSelected: Set<string>;
  disableButton: boolean;
  raffleId: number;
}

const MultiStepForm = ({
  raffleId,
  quotesSelected,
  totalPrice,
  disableButton,
}: MultiStepProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const methods = useForm<UserFormType>({
    resolver: zodResolver(userFormSchema),
  });

  const [userData, setUserData] = useState<UserFormType | null>(null);

  const handleNext = async () => {
    if (activeStep === 0) {
      const isValid = await methods.trigger();
      if (!isValid) return;
      const data = methods.watch();
      setUserData(data);
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <UserForm />;
      case 1:
        return (
          <PaymentCard
            totalPrice={totalPrice}
            quotesSelected={quotesSelected}
            raffleId={raffleId}
            userData={userData}
          />
        );
      default:
        return "Etapa desconhecida";
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={disableButton}
            onClick={() => setIsOpen(true)}
            className="mb-4 w-32 h-16"
          >
            Reservar
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full">
          <FormProvider {...methods}>
            <Stepper activeStep={activeStep}>
              {steps.map((label, index) => (
                <Step key={index}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <div>{getStepContent(activeStep)}</div>

            <div className="flex justify-between">
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Voltar
              </Button>
              <Button
                disabled={methods.getValues != null ? false : true}
                onClick={
                  activeStep === steps.length - 1
                    ? () => setIsOpen(false)
                    : handleNext
                }
                className={activeStep === steps.length - 1 ? " hidden" : ""}
              >
                {"Proximo"}
              </Button>
            </div>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MultiStepForm;
