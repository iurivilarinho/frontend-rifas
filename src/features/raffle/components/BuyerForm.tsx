import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { CheckCircle2, Loader2 } from "lucide-react";

import { apiClient } from "@/api/clients/apiClient";
import { Field, FieldError, FieldLabel } from "@/components/input/base/Field";
import { Input } from "@/components/input/base/Input";
import { maskCPF, maskPhoneBR, onlyDigits } from "@/utils/formatters";
import { isValidCPF } from "@/utils/validations";

import type { BuyerFormValues } from "./ReservationDialog";

interface BuyerLookupResponse {
  id: number;
  fullName: string;
  cpf: string;
  numberPhone: string;
  email: string;
}

type LookupState = "idle" | "loading" | "found" | "not-found";

export const BuyerForm = () => {
  const {
    register,
    setValue,
    clearErrors,
    trigger,
    getValues,
    formState: { errors, touchedFields, submitCount },
  } = useFormContext<BuyerFormValues>();

  const [focusedField, setFocusedField] = useState<keyof BuyerFormValues | null>(
    null,
  );
  const [lookup, setLookup] = useState<LookupState>("idle");

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

  const performLookup = async (cpfDigits: string) => {
    setLookup("loading");
    try {
      const { data } = await apiClient.get<BuyerLookupResponse>(
        `/reservation/buyer/${cpfDigits}`,
      );
      // Auto-preenche os outros campos.
      setValue("fullName", data.fullName ?? "", { shouldValidate: true });
      setValue("numberPhone", maskPhoneBR(data.numberPhone ?? ""), {
        shouldValidate: true,
      });
      setValue("email", data.email ?? "", { shouldValidate: true });
      clearErrors(["fullName", "numberPhone", "email"]);
      setLookup("found");
      // Valida tudo agora que está preenchido.
      void trigger();
    } catch (e) {
      const status =
        (e as { response?: { status?: number } })?.response?.status ?? 0;
      // 404 = não encontrado. Outros erros: trata como "novo cadastro".
      if (status === 404 || status === 0) {
        setLookup("not-found");
        return;
      }
      setLookup("idle");
    }
  };

  const handleCpfChange = (raw: string) => {
    const masked = maskCPF(raw);
    setValue("cpf", masked, { shouldDirty: true, shouldValidate: false });
    const digits = onlyDigits(masked);
    if (digits.length < 11) {
      setLookup("idle");
      clearErrors("cpf");
      return;
    }
    // 11 dígitos: valida o CPF e, se válido, tenta buscar usuário existente.
    void trigger("cpf").then((ok) => {
      if (ok && isValidCPF(digits)) {
        void performLookup(digits);
      }
    });
  };

  const cpfDigits = onlyDigits(getValues("cpf") ?? "");
  const cpfComplete = cpfDigits.length === 11 && isValidCPF(cpfDigits);

  return (
    <div className="space-y-3">
      <Field className="min-w-0">
        <FieldLabel htmlFor="cpf">CPF</FieldLabel>
        <div className="relative">
          <Input
            id="cpf"
            inputMode="numeric"
            autoComplete="off"
            maxLength={14}
            className="w-full min-w-0 pr-9"
            placeholder="000.000.000-00"
            {...cpfReg}
            onFocus={() => {
              setFocusedField("cpf");
              clearErrors("cpf");
            }}
            onBlur={(e) => {
              setFocusedField((prev) => (prev === "cpf" ? null : prev));
              cpfReg.onBlur(e);
            }}
            onChange={(e) => handleCpfChange(e.target.value)}
            aria-invalid={shouldShowError("cpf") && Boolean(errors.cpf)}
          />
          {lookup === "loading" && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
          {lookup === "found" && (
            <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          )}
        </div>
        {shouldShowError("cpf") && errors.cpf && (
          <FieldError>{errors.cpf.message}</FieldError>
        )}
        {lookup === "found" && (
          <p className="text-xs text-primary">
            Encontramos seu cadastro — confirme os dados abaixo.
          </p>
        )}
        {lookup === "not-found" && cpfComplete && (
          <p className="text-xs text-muted-foreground">
            Primeira compra com este CPF. Preencha os dados abaixo.
          </p>
        )}
      </Field>

      {cpfComplete && lookup !== "loading" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field className="min-w-0 sm:col-span-2">
            <FieldLabel htmlFor="fullName">Nome completo</FieldLabel>
            <Input
              id="fullName"
              autoComplete="name"
              className="w-full min-w-0"
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

          <Field className="min-w-0">
            <FieldLabel htmlFor="numberPhone">Telefone</FieldLabel>
            <Input
              id="numberPhone"
              inputMode="tel"
              autoComplete="tel-national"
              maxLength={15}
              className="w-full min-w-0"
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
              aria-invalid={
                shouldShowError("numberPhone") && Boolean(errors.numberPhone)
              }
            />
            {shouldShowError("numberPhone") && errors.numberPhone && (
              <FieldError>{errors.numberPhone.message}</FieldError>
            )}
          </Field>

          <Field className="min-w-0">
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              className="w-full min-w-0"
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
      )}
    </div>
  );
};
