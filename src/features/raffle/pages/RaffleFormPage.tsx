import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { BadgeCheck, Eye, Pencil, Plus } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/button/Button";
import { Loading } from "@/components/Loading";
import { Field, FieldError, FieldLabel } from "@/components/input/base/Field";
import { Input } from "@/components/input/base/Input";
import { Label } from "@/components/input/base/Label";
import { EditorBlockNoteMd } from "@/components/input/MarkdownField";
import DateInput from "@/components/input/DateInput";
import { DragAndDrop } from "@/components/dragAndDrop/DragAndDrop";
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

  const Icon = pageMeta.icon;
  const coverFiles = watch("cover");
  const imagesFiles = watch("images");

  return (
    <div className="min-h-screen min-h-[100dvh] bg-green-50 px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 rounded-xl border border-green-200 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-green-200 bg-green-50 p-2">
                <Icon className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {pageMeta.title}
                </h1>
                <p className="text-sm text-gray-600">
                  Preencha os detalhes e publique uma campanha de sorteio beneficente.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <BadgeCheck className="h-4 w-4 text-green-700" />
              <span>Transparência e organização</span>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(submitRaffle)}
          className="rounded-xl border border-green-200 bg-white p-6 space-y-6"
        >
          <Field>
            <FieldLabel htmlFor="title">Título</FieldLabel>
            <Input
              id="title"
              {...register("title")}
              disabled={isViewMode}
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title && <FieldError>{errors.title.message}</FieldError>}
          </Field>

          <Field>
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

          <div className="rounded-lg border border-green-100 bg-green-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Exibir cotas</p>
                <p className="text-xs text-gray-600">
                  Define se as cotas ficam visíveis para o usuário.
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

          <div className="rounded-lg border border-green-100 bg-green-50 p-4">
            <p className="mb-4 font-medium text-gray-900">Agendamento do sorteio</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between">
                  <Label>Sortear após realizar as vendas</Label>
                  <Switch checked disabled />
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  O sorteio é realizado quando a campanha atingir o objetivo.
                </p>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <Label className="mb-2 block">Data de sorteio (opcional)</Label>
                <DateInput label="" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="numberOfShares">Quantidade de Cotas</FieldLabel>
              <Input
                id="numberOfShares"
                type="number"
                {...register("numberOfShares", { valueAsNumber: true })}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.numberOfShares)}
              />
              {errors.numberOfShares && (
                <FieldError>{errors.numberOfShares.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="quotaPrice">Valor por cota</FieldLabel>
              <Input
                id="quotaPrice"
                type="number"
                step="0.01"
                {...register("quotaPrice", { valueAsNumber: true })}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.quotaPrice)}
              />
              {errors.quotaPrice && (
                <FieldError>{errors.quotaPrice.message}</FieldError>
              )}
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="minPurchaseShares">Compra mínima por venda</FieldLabel>
              <Input
                id="minPurchaseShares"
                type="number"
                {...register("minPurchaseShares", { valueAsNumber: true })}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.minPurchaseShares)}
              />
              {errors.minPurchaseShares && (
                <FieldError>{errors.minPurchaseShares.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="maxPurchaseShares">Compra máxima por venda</FieldLabel>
              <Input
                id="maxPurchaseShares"
                type="number"
                {...register("maxPurchaseShares", { valueAsNumber: true })}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.maxPurchaseShares)}
              />
              {errors.maxPurchaseShares && (
                <FieldError>{errors.maxPurchaseShares.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="standardSalesPercentage">
                Percentual padrão de vendas (%)
              </FieldLabel>
              <Input
                id="standardSalesPercentage"
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="Ex.: 10"
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
              <p className="mt-1 text-xs text-gray-600">
                Informe de 0 a 100. Deixe em branco para não aplicar percentual padrão.
              </p>
            </Field>
          </div>

          <div className="border-t pt-6">
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Detalhes do prêmio
            </h2>

            <Field>
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

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                <p className="mb-2 font-medium text-gray-900">Imagem de capa</p>
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

              <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                <p className="mb-2 font-medium text-gray-900">Imagens do prêmio</p>
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
          </div>

          {!isViewMode && (
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : formType === "edit" ? "Editar Ação" : "Cadastrar Ação"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
