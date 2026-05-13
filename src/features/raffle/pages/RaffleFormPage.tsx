import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { BadgeCheck, CalendarClock, Eye, Image, Pencil, Plus, Trophy } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/button/Button";
import { SectionCard, SectionCardHeader } from "@/components/card/SectionCard";
import { Loading } from "@/components/Loading";
import { Field, FieldError, FieldLabel } from "@/components/input/base/Field";
import { Input } from "@/components/input/base/Input";
import { Label } from "@/components/input/base/Label";
import { EditorBlockNoteMd } from "@/components/input/MarkdownField";
import DateInput from "@/components/input/DateInput";
import { DragAndDrop } from "@/components/dragAndDrop/DragAndDrop";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { isFormType, type FormType } from "@/types/formType";

import { useGetRaffleById } from "../api/services/useRaffleService";
import { useRaffleFormSubmit } from "../hooks/useRaffleFormSubmit";

const raffleFormSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  numberOfShares: z.number().positive("A quantidade de cotas deve ser positiva"),
  quotaPrice: z.number().positive("O valor por cota deve ser positivo"),
  minPurchaseShares: z.number().positive("A compra mínima deve ser positiva"),
  maxPurchaseShares: z.number().positive("A compra máxima deve ser positiva"),
  descriptionAward: z.string().min(1, "A descrição da premiação é obrigatória"),
  showQuotas: z.boolean(),
  standardSalesPercentage: z.number().optional(),
  cover: z
    .array(z.any())
    .refine((files) => Array.isArray(files) && files.length === 1, {
      message: "Adicione a imagem de capa",
    }),
  images: z
    .array(z.any())
    .refine((files) => Array.isArray(files) && files.length > 0, {
      message: "Adicione ao menos uma imagem",
    }),
});

type RaffleFormValues = z.infer<typeof raffleFormSchema>;

const DEFAULT_RAFFLE_FORM_VALUES: RaffleFormValues = {
  title: "",
  description: "",
  numberOfShares: 0,
  quotaPrice: 0,
  minPurchaseShares: 0,
  maxPurchaseShares: 0,
  descriptionAward: "",
  showQuotas: true,
  standardSalesPercentage: undefined,
  cover: [],
  images: [],
};

export type { RaffleFormValues };

export const RaffleFormPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const formType: FormType = isFormType(params.formType) ? params.formType : "create";
  const raffleId = params.raffleId;
  const isViewMode = formType === "view";
  const needsId = formType === "edit" || formType === "view";

  const pageMeta = useMemo(() => {
    if (formType === "edit") return { title: "Editar Ação", icon: Pencil };
    if (formType === "view") return { title: "Visualizar Ação", icon: Eye };
    return { title: "Cadastrar Rifa", icon: Plus };
  }, [formType]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<RaffleFormValues>({
    resolver: zodResolver(raffleFormSchema),
    defaultValues: DEFAULT_RAFFLE_FORM_VALUES,
  });

  const { data: raffleData, isLoading: isLoadingRaffle } = useGetRaffleById(
    needsId ? raffleId : undefined,
  );

  const { handleSubmit: submitRaffle, isLoading: isSaving } = useRaffleFormSubmit({
    id: raffleId,
    formType,
    onSuccess: () => navigate("/panel"),
  });

  useEffect(() => {
    if (raffleData) {
      reset({
        title: raffleData.title ?? "",
        description: raffleData.description ?? "",
        descriptionAward: raffleData.descriptionAward ?? "",
        numberOfShares: raffleData.numberOfShares ?? 0,
        quotaPrice: raffleData.quotaPrice ?? 0,
        minPurchaseShares: raffleData.minPurchaseShares ?? 0,
        maxPurchaseShares: raffleData.maxPurchaseShares ?? 0,
        showQuotas: raffleData.showQuotas ?? true,
        standardSalesPercentage: raffleData.standardSalesPercentage,
        cover: raffleData.cover ? [raffleData.cover] : [],
        images: Array.isArray(raffleData.images) ? raffleData.images : [],
      });
    }
  }, [raffleData, reset]);

  if (isLoadingRaffle || isSaving) return <Loading />;

  const coverFiles = watch("cover");
  const imagesFiles = watch("images");
  const HeaderIcon = pageMeta.icon;

  return (
    <PageShell maxWidth="4xl">
      <PageHeader
        title={pageMeta.title}
        description="Preencha os detalhes e publique uma campanha."
        actions={
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <BadgeCheck className="h-4 w-4 text-primary" />
            <span>Transparência e organização</span>
          </div>
        }
      />

      <form onSubmit={handleSubmit(submitRaffle)} className="grid gap-6">
        <SectionCard>
          <SectionCardHeader icon={HeaderIcon} title="Dados básicos" />
          <div className="space-y-4 px-5 py-4">
            <Field className="min-w-0">
              <FieldLabel htmlFor="title">Título</FieldLabel>
              <Input
                id="title"
                className="w-full min-w-0"
                {...register("title")}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.title)}
              />
              {errors.title && <FieldError>{errors.title.message}</FieldError>}
            </Field>

            <Field className="min-w-0">
              <FieldLabel htmlFor="description">Descrição</FieldLabel>
              <Textarea
                id="description"
                placeholder="Descrição da ação"
                {...register("description")}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.description)}
              />
              {errors.description && (
                <FieldError>{errors.description.message}</FieldError>
              )}
            </Field>

            <div className="rounded-md border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">Exibir cotas</p>
                  <p className="text-xs text-muted-foreground">
                    Define se a grade de cotas fica visível pro comprador.
                  </p>
                </div>
                <Controller
                  name="showQuotas"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isViewMode}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionCardHeader icon={CalendarClock} title="Agendamento do sorteio" />
          <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
            <div className="rounded-md border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <Label>Sortear após realizar as vendas</Label>
                <Switch checked disabled />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                O sorteio é realizado quando a campanha atingir o objetivo.
              </p>
            </div>
            <div className="rounded-md border border-border bg-card p-4">
              <Label className="mb-2 block">Data de sorteio (opcional)</Label>
              <DateInput label="" />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionCardHeader icon={Trophy} title="Cotas e preço" />
          <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
            <Field className="min-w-0">
              <FieldLabel htmlFor="numberOfShares">Quantidade de cotas</FieldLabel>
              <Input
                id="numberOfShares"
                type="number"
                className="w-full min-w-0"
                {...register("numberOfShares", { valueAsNumber: true })}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.numberOfShares)}
              />
              {errors.numberOfShares && (
                <FieldError>{errors.numberOfShares.message}</FieldError>
              )}
            </Field>

            <Field className="min-w-0">
              <FieldLabel htmlFor="quotaPrice">Valor por cota (R$)</FieldLabel>
              <Input
                id="quotaPrice"
                type="number"
                step="0.01"
                className="w-full min-w-0"
                {...register("quotaPrice", { valueAsNumber: true })}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.quotaPrice)}
              />
              {errors.quotaPrice && (
                <FieldError>{errors.quotaPrice.message}</FieldError>
              )}
            </Field>

            <Field className="min-w-0">
              <FieldLabel htmlFor="minPurchaseShares">Compra mínima</FieldLabel>
              <Input
                id="minPurchaseShares"
                type="number"
                className="w-full min-w-0"
                {...register("minPurchaseShares", { valueAsNumber: true })}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.minPurchaseShares)}
              />
              {errors.minPurchaseShares && (
                <FieldError>{errors.minPurchaseShares.message}</FieldError>
              )}
            </Field>

            <Field className="min-w-0">
              <FieldLabel htmlFor="maxPurchaseShares">Compra máxima</FieldLabel>
              <Input
                id="maxPurchaseShares"
                type="number"
                className="w-full min-w-0"
                {...register("maxPurchaseShares", { valueAsNumber: true })}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.maxPurchaseShares)}
              />
              {errors.maxPurchaseShares && (
                <FieldError>{errors.maxPurchaseShares.message}</FieldError>
              )}
            </Field>

            <Field className="min-w-0 sm:col-span-2">
              <FieldLabel htmlFor="standardSalesPercentage">
                Percentual padrão de vendas (%)
              </FieldLabel>
              <Input
                id="standardSalesPercentage"
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="Ex.: 10"
                className="w-full min-w-0"
                {...register("standardSalesPercentage", {
                  setValueAs: (v) => {
                    if (v === "" || v === null || v === undefined) return undefined;
                    const n = Number(v);
                    return Number.isFinite(n) ? n : undefined;
                  },
                })}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.standardSalesPercentage)}
              />
              {errors.standardSalesPercentage && (
                <FieldError>{errors.standardSalesPercentage.message}</FieldError>
              )}
              <p className="text-xs text-muted-foreground">
                Informe de 0 a 100. Deixe em branco para não aplicar percentual padrão.
              </p>
            </Field>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionCardHeader icon={Trophy} title="Prêmio e regulamento" />
          <div className="px-5 py-4">
            <Field className="min-w-0">
              <FieldLabel htmlFor="descriptionAward">
                Descrição da premiação
              </FieldLabel>
              <Controller
                name="descriptionAward"
                control={control}
                render={({ field }) => (
                  <EditorBlockNoteMd
                    docKey={raffleId ?? "new"}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    disabled={isViewMode}
                    error={Boolean(errors.descriptionAward)}
                    minHeight={320}
                  />
                )}
              />
              {errors.descriptionAward && (
                <FieldError>{errors.descriptionAward.message}</FieldError>
              )}
            </Field>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionCardHeader icon={Image} title="Imagens" />
          <div className="grid gap-4 px-5 py-4 lg:grid-cols-2">
            <div className="rounded-md border border-border bg-muted/40 p-4">
              <p className="mb-2 font-medium text-foreground">Imagem de capa</p>
              <DragAndDrop
                id="cover"
                label=""
                value={coverFiles ?? []}
                onChange={(files) =>
                  setValue("cover", files, { shouldValidate: true })
                }
                multiple={false}
                maxFiles={1}
                disabled={isViewMode}
                acceptedFileTypes={{
                  "image/jpeg": [".jpg", ".jpeg"],
                  "image/png": [".png"],
                }}
                notification={{
                  isError: Boolean(errors.cover),
                  notification: String(errors.cover?.message ?? ""),
                }}
              />
            </div>

            <div className="rounded-md border border-border bg-muted/40 p-4">
              <p className="mb-2 font-medium text-foreground">Imagens do prêmio</p>
              <DragAndDrop
                id="images"
                label=""
                value={imagesFiles ?? []}
                onChange={(files) =>
                  setValue("images", files, { shouldValidate: true })
                }
                multiple
                disabled={isViewMode}
                acceptedFileTypes={{
                  "image/jpeg": [".jpg", ".jpeg"],
                  "image/png": [".png"],
                }}
                notification={{
                  isError: Boolean(errors.images),
                  notification: String(errors.images?.message ?? ""),
                }}
              />
            </div>
          </div>
        </SectionCard>

        {!isViewMode && (
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? "Salvando..."
                : formType === "edit"
                  ? "Salvar alterações"
                  : "Cadastrar rifa"}
            </Button>
          </div>
        )}
      </form>
    </PageShell>
  );
};
