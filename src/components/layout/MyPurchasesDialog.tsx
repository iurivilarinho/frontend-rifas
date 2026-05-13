import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog/Dialog";
import { Field, FieldError } from "@/components/input/base/Field";
import { Input } from "@/components/input/base/Input";
import { maskCPF, onlyDigits } from "@/utils/formatters";
import { isValidCPF } from "@/utils/validations";

const schema = z.object({
  cpf: z.string().refine((v) => isValidCPF(onlyDigits(v)), {
    message: "CPF inválido!",
  }),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
};

export const MyPurchasesDialog = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { cpf: "" },
  });

  useEffect(() => {
    if (!open) reset({ cpf: "" });
  }, [open, reset]);

  const handleCpfChange = (raw: string) => {
    const masked = maskCPF(raw);
    setValue("cpf", masked, { shouldValidate: false });
    // Só valida quando o CPF está completo (11 dígitos).
    // Enquanto estiver incompleto, limpa erros pra não mostrar "inválido" digitando.
    if (onlyDigits(masked).length === 11) {
      void trigger("cpf");
    } else {
      clearErrors("cpf");
    }
  };

  const onSubmit = (values: FormValues) => {
    const cpf = onlyDigits(values.cpf);
    onOpenChange(false);
    navigate(`/raffles/${cpf}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-3 overflow-hidden p-4 sm:max-w-xs">
        <DialogHeader className="space-y-1">
          <DialogTitle className="inline-flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4 text-primary" />
            Minhas compras
          </DialogTitle>
          <DialogDescription className="text-xs">
            Informe o CPF usado na compra.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Field className="min-w-0">
            <Input
              id="purchases-cpf"
              placeholder="000.000.000-00"
              inputMode="numeric"
              autoComplete="off"
              maxLength={14}
              className="w-full min-w-0"
              {...register("cpf")}
              onChange={(e) => handleCpfChange(e.target.value)}
              aria-invalid={Boolean(errors.cpf)}
            />
            {errors.cpf && <FieldError>{errors.cpf.message}</FieldError>}
          </Field>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              Continuar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
