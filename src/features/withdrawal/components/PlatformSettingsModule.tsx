import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Settings } from "lucide-react";

import { Button } from "@/components/button/Button";
import { SectionCard, SectionCardHeader } from "@/components/card/SectionCard";
import { Field, FieldError, FieldLabel } from "@/components/input/base/Field";
import { Input } from "@/components/input/base/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/Loading";

import {
  useGetPlatformSettings,
  useUpdatePlatformSettings,
} from "../api/services/useWithdrawalService";

const schema = z.object({
  platformFeePercentage: z
    .string()
    .refine(
      (v) => v !== "" && !Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100,
      { message: "Taxa deve estar entre 0 e 100." },
    ),
  minimumWithdrawalAmount: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)) && Number(v) >= 0, {
      message: "Valor mínimo não pode ser negativo.",
    }),
});

type FormValues = z.infer<typeof schema>;

export const PlatformSettingsModule = () => {
  const { data, isLoading } = useGetPlatformSettings();
  const { mutateAsync, isPending } = useUpdatePlatformSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { platformFeePercentage: "0", minimumWithdrawalAmount: "0" },
  });

  useEffect(() => {
    if (data) {
      reset({
        platformFeePercentage: String(data.platformFeePercentage ?? 0),
        minimumWithdrawalAmount: String(data.minimumWithdrawalAmount ?? 0),
      });
    }
  }, [data, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      await mutateAsync({
        platformFeePercentage: Number(values.platformFeePercentage),
        minimumWithdrawalAmount: Number(values.minimumWithdrawalAmount),
      });
      toast.success("Configurações atualizadas.");
    } catch (e) {
      const msg =
        (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error(
        Array.isArray(msg) ? msg.join(" · ") : msg ?? "Falha ao salvar configurações.",
      );
    }
  };

  if (isLoading) return <Loading />;

  return (
    <section className="flex flex-col gap-4">
      <PageHeader
        title="Configurações da plataforma"
        description="Taxa cobrada das vendas e valor mínimo de saque."
      />

      <SectionCard>
        <SectionCardHeader icon={Settings} title="Comissão e saque mínimo" />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-5 py-4">
          <Field>
            <FieldLabel htmlFor="platformFeePercentage">
              Taxa da plataforma (%)
            </FieldLabel>
            <Input
              id="platformFeePercentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register("platformFeePercentage")}
              aria-invalid={Boolean(errors.platformFeePercentage)}
            />
            {errors.platformFeePercentage && (
              <FieldError>{errors.platformFeePercentage.message}</FieldError>
            )}
            <p className="text-xs text-muted-foreground">
              Ex: 5,00 = a plataforma retém 5% do valor bruto das vendas.
            </p>
          </Field>

          <Field>
            <FieldLabel htmlFor="minimumWithdrawalAmount">
              Valor mínimo de saque (R$)
            </FieldLabel>
            <Input
              id="minimumWithdrawalAmount"
              type="number"
              step="0.01"
              min="0"
              {...register("minimumWithdrawalAmount")}
              aria-invalid={Boolean(errors.minimumWithdrawalAmount)}
            />
            {errors.minimumWithdrawalAmount && (
              <FieldError>{errors.minimumWithdrawalAmount.message}</FieldError>
            )}
          </Field>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </section>
  );
};
