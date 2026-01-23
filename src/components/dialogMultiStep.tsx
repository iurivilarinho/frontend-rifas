import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import BuyerForm, {
  userFormSchema,
  UserFormType,
} from "@/pages/buyer/buyerForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { Step, StepLabel, Stepper } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./button/button";
import PaymentCard from "./PaymentCard";
import { ShoppingCart } from "lucide-react";

// Importe o schema de validação

const steps = ["Identificar Comprador", "Opções de Pagamento"];

interface MultiStepProps {
  totalPrice: number;
  quotesSelected: Set<string>;
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
  const [activeStep, setActiveStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const methods = useForm<UserFormType>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: "",
    },
  });

  const [userData, setUserData] = useState<UserFormType | null>(null);

  const handleNext = (data: UserFormType) => {
    setUserData(data);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <BuyerForm form={methods} />;
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
          {showButtonBuy && (
            <Button
              disabled={disableButton}
              onClick={() => setIsOpen(true)}
              className="mb-4 w-32 h-16"
            >
              <ShoppingCart /> Reservar
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="w-full">
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
                  : methods.handleSubmit(handleNext)
              }
              className={activeStep === steps.length - 1 ? " hidden" : ""}
            >
              {"Proximo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MultiStepForm;
