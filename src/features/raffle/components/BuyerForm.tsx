import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/input/base/Field";
import { Input } from "@/components/input/base/Input";
import { maskCPF, maskPhoneBR } from "@/utils/formatters";
import type { BuyerFormValues } from "./ReservationDialog";

export const BuyerForm = () => {
  const {
    register,
    setValue,
    clearErrors,
    formState: { errors, touchedFields, submitCount },
  } = useFormContext<BuyerFormValues>();

  const [focusedField, setFocusedField] = useState<keyof BuyerFormValues | null>(null);

  const fullNameReg = register("fullName");
  const emailReg = register("email");
  const cpfReg = register("cpf");
  const phoneReg = register("numberPhone");

  const shouldShowError = useMemo(() => {
    return (field: keyof BuyerFormValues) => {
      const triedToAdvance = submitCount > 0;
      const touched = Boolean(touchedFields[field]);
      const isFocused = focusedField === field;
      return triedToAdvance || (touched && !isFocused);
    };
  }, [focusedField, submitCount, touchedFields]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="fullName">Nome completo</FieldLabel>
        <Input
          id="fullName"
          autoComplete="name"
          {...fullNameReg}
          onFocus={() => {
            setFocusedField("fullName");
            clearErrors("fullName");
          }}
          onBlur={(e) => {
            setFocusedField((prev) => (prev === "fullName" ? null : prev));
            fullNameReg.onBlur(e);
          }}
          aria-invalid={shouldShowError("fullName") && Boolean(errors.fullName)}
        />
        {shouldShowError("fullName") && errors.fullName && (
          <FieldError>{errors.fullName.message}</FieldError>
        )}
      </Field>

      <Field>
        <FieldLabel htmlFor="cpf">CPF</FieldLabel>
        <Input
          id="cpf"
          inputMode="numeric"
          autoComplete="off"
          maxLength={14}
          {...cpfReg}
          onFocus={() => {
            setFocusedField("cpf");
            clearErrors("cpf");
          }}
          onBlur={(e) => {
            setFocusedField((prev) => (prev === "cpf" ? null : prev));
            cpfReg.onBlur(e);
          }}
          onChange={(e) => {
            setValue("cpf", maskCPF(e.target.value), {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
          aria-invalid={shouldShowError("cpf") && Boolean(errors.cpf)}
        />
        {shouldShowError("cpf") && errors.cpf && (
          <FieldError>{errors.cpf.message}</FieldError>
        )}
      </Field>

      <Field>
        <FieldLabel htmlFor="numberPhone">Telefone</FieldLabel>
        <Input
          id="numberPhone"
          inputMode="tel"
          autoComplete="tel-national"
          maxLength={15}
          {...phoneReg}
          onFocus={() => {
            setFocusedField("numberPhone");
            clearErrors("numberPhone");
          }}
          onBlur={(e) => {
            setFocusedField((prev) => (prev === "numberPhone" ? null : prev));
            phoneReg.onBlur(e);
          }}
          onChange={(e) => {
            setValue("numberPhone", maskPhoneBR(e.target.value), {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
          aria-invalid={shouldShowError("numberPhone") && Boolean(errors.numberPhone)}
        />
        {shouldShowError("numberPhone") && errors.numberPhone && (
          <FieldError>{errors.numberPhone.message}</FieldError>
        )}
      </Field>

      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="email">E-mail</FieldLabel>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          {...emailReg}
          onFocus={() => {
            setFocusedField("email");
            clearErrors("email");
          }}
          onBlur={(e) => {
            setFocusedField((prev) => (prev === "email" ? null : prev));
            emailReg.onBlur(e);
          }}
          aria-invalid={shouldShowError("email") && Boolean(errors.email)}
        />
        {shouldShowError("email") && errors.email && (
          <FieldError>{errors.email.message}</FieldError>
        )}
      </Field>
    </div>
  );
};
