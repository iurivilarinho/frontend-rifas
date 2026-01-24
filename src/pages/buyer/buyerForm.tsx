import { Field, FieldError, FieldLabel } from "@/components/input/Field";
import { Input } from "@/components/input/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { maskCPF, maskPhoneBR, onlyDigits } from "@/utils/formatters";
import { isValidCPF } from "@/utils/validations";
import { UseFormReturn } from "react-hook-form";
import { useMemo, useState } from "react";
import z from "zod";

// Schema de validação usando Zod
export const userFormSchema = z.object({
  fullName: z.string().min(1, { error: "O nome completo é obrigatório!" }),
  email: z.email("Formato de email inválido!"),

  cpf: z
    .string()
    .refine((v) => onlyDigits(v).length === 11, { message: "CPF incompleto!" })
    .refine((v) => isValidCPF(onlyDigits(v)), { message: "CPF inválido!" }),

  numberPhone: z.string().refine(
    (v) => {
      const len = onlyDigits(v).length;
      return len === 10 || len === 11;
    },
    { message: "Telefone inválido!" },
  ),
});

export type UserFormType = z.infer<typeof userFormSchema>;

interface BuyerFormProps {
  form: UseFormReturn<UserFormType>;
}

const BuyerForm = ({ form }: BuyerFormProps) => {
  const [focusedField, setFocusedField] = useState<keyof UserFormType | null>(
    null,
  );

  const {
    clearErrors,
    setValue,
    register,
    formState: { errors, touchedFields, submitCount },
  } = form;

  const fullNameReg = register("fullName");
  const emailReg = register("email");
  const cpfReg = register("cpf");
  const phoneReg = register("numberPhone");

  const shouldShowError = useMemo(() => {
    return (field: keyof UserFormType) => {
      const triedToAdvance = submitCount > 0;
      const touched = Boolean(touchedFields[field]);
      const isFocused = focusedField === field;

      // Regras:
      // - se tentou avançar: mostra erro mesmo focado
      // - senão: mostra apenas se tocou e NÃO está focado (evita erro enquanto digita)
      return triedToAdvance || (touched && !isFocused);
    };
  }, [focusedField, submitCount, touchedFields]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes Pessoais</CardTitle>
        <CardDescription>Preencha os dados pessoais abaixo</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-3">
          {/* Nome */}
          <Field>
            <FieldLabel htmlFor="fullName">Nome Completo</FieldLabel>
            <Input
              id="fullName"
              className="w-full"
              {...fullNameReg}
              onFocus={() => {
                setFocusedField("fullName");
                clearErrors("fullName");
              }}
              onBlur={(e) => {
                setFocusedField((prev) => (prev === "fullName" ? null : prev));
                fullNameReg.onBlur(e);
              }}
              onChange={(e) => {
                fullNameReg.onChange(e);
              }}
              aria-invalid={shouldShowError("fullName") && Boolean(errors.fullName)}
            />
            {shouldShowError("fullName") && errors.fullName?.message && (
              <FieldError>{String(errors.fullName.message)}</FieldError>
            )}
          </Field>

          {/* CPF */}
          <Field>
            <FieldLabel htmlFor="cpf">CPF</FieldLabel>
            <Input
              id="cpf"
              className="w-full"
              inputMode="numeric"
              maxLength={14}
              {...cpfReg}
              onFocus={() => {
                setFocusedField("cpf");
                // opcional: some com a mensagem ao focar
                clearErrors("cpf");
              }}
              onBlur={(e) => {
                setFocusedField((prev) => (prev === "cpf" ? null : prev));
                cpfReg.onBlur(e); // marca touched
              }}
              onChange={(e) => {
                const masked = maskCPF(e.target.value);

                // Atualiza isValid enquanto digita, mas não força mostrar erro (a UI decide)
                setValue("cpf", masked, {
                  shouldDirty: true,
                  shouldValidate: true,
                  shouldTouch: false,
                });
              }}
              aria-invalid={shouldShowError("cpf") && Boolean(errors.cpf)}
            />
            {shouldShowError("cpf") && errors.cpf?.message && (
              <FieldError>{String(errors.cpf.message)}</FieldError>
            )}
          </Field>

          {/* Telefone */}
          <Field>
            <FieldLabel htmlFor="numberPhone">Telefone Celular</FieldLabel>
            <Input
              id="numberPhone"
              className="w-full"
              inputMode="numeric"
              maxLength={15}
              {...phoneReg}
              onFocus={() => {
                setFocusedField("numberPhone");
                clearErrors("numberPhone");
              }}
              onBlur={(e) => {
                setFocusedField((prev) =>
                  prev === "numberPhone" ? null : prev,
                );
                phoneReg.onBlur(e);
              }}
              onChange={(e) => {
                const masked = maskPhoneBR(e.target.value);

                setValue("numberPhone", masked, {
                  shouldDirty: true,
                  shouldValidate: true,
                  shouldTouch: false,
                });
              }}
              aria-invalid={
                shouldShowError("numberPhone") && Boolean(errors.numberPhone)
              }
            />
            {shouldShowError("numberPhone") && errors.numberPhone?.message && (
              <FieldError>{String(errors.numberPhone.message)}</FieldError>
            )}
          </Field>

          {/* Email */}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              className="w-full"
              type="email"
              {...emailReg}
              onFocus={() => {
                setFocusedField("email");
                clearErrors("email");
              }}
              onBlur={(e) => {
                setFocusedField((prev) => (prev === "email" ? null : prev));
                emailReg.onBlur(e);
              }}
              onChange={(e) => {
                emailReg.onChange(e);
              }}
              aria-invalid={shouldShowError("email") && Boolean(errors.email)}
            />
            {shouldShowError("email") && errors.email?.message && (
              <FieldError>{String(errors.email.message)}</FieldError>
            )}
          </Field>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuyerForm;
