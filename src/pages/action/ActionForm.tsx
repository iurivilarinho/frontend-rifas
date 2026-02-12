import { Button } from "@/components/button/button";
import { useCustomDialogContext } from "@/components/dialog/useCustomDialogContext";
import DragAndDrop from "@/components/dragAndDrop/DragAndDrop";
import DataInput from "@/components/input/DateInput";
import { Field, FieldError, FieldLabel } from "@/components/input/Field";
import { Input } from "@/components/input/Input";
import { Label } from "@/components/input/Label";
import { EditorBlockNoteMd } from "@/components/input/MarkDownField";
import Loading from "@/components/Loading";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import {
  useGetRifaById,
  usePostRifa,
  usePutRifa,
} from "@/lib/api/tanstackQuery/rifa";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Eye, Pencil, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

const FORM_TYPES = ["create", "edit", "view"] as const;
type FormType = (typeof FORM_TYPES)[number];

const isFormType = (v: unknown): v is FormType =>
  typeof v === "string" && (FORM_TYPES as readonly string[]).includes(v);

const rifaFormSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  numberOfShares: z
    .number()
    .positive("A quantidade de cotas deve ser positiva"),
  quotaPrice: z.number().positive("O valor por cota deve ser positivo"),
  minPurchaseShares: z.number().positive("A compra mínima deve ser positiva"),
  maxPurchaseShares: z.number().positive("A compra máxima deve ser positiva"),
  descriptionAward: z.string().min(1, "A descrição da premiação é obrigatória"),
  showQuotas: z.boolean(),
  standardSalesPercentage: z.number().optional(),
  cover: z.any().refine((files) => Array.isArray(files) && files.length === 1, {
    message: "Adicione a imagem de capa",
  }),

  images: z.any().refine((files) => Array.isArray(files) && files.length > 0, {
    message: "Adicione ao menos uma imagem",
  }),
});

type RifaFormData = z.infer<typeof rifaFormSchema>;

const convertDocumentToFile = (document: any): File => {
  const byteString = atob(document.documento);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  const blob = new Blob([ab], { type: document.contentType });
  return new File([blob], document.nome, { type: document.contentType });
};

const buildRifaFormData = (data: RifaFormData) => {
  const formData = new FormData();
  const { images, cover, ...props } = data;

  // cover (File[])
  if (Array.isArray(cover) && cover[0]) {
    const file = cover[0];
    formData.append(
      "cover",
      (file as any)?.documento ? convertDocumentToFile(file) : file,
    );
  }

  // images (File[])
  if (Array.isArray(images)) {
    images.forEach((file) => {
      formData.append(
        "images",
        (file as any)?.documento ? convertDocumentToFile(file) : file,
      );
    });
  }

  // ✅ props inclui showQuotas (boolean)
  formData.append(
    "request",
    new Blob([JSON.stringify(props)], { type: "application/json" }),
  );

  return formData;
};

const RifaForm = () => {
  const navigate = useNavigate();
  const { setCustomDialog } = useCustomDialogContext();
  const params = useParams();
  const formTypeParam = params.formType;
  const raffleId = params.raffleId;

  const formType: FormType = isFormType(formTypeParam)
    ? formTypeParam
    : "create";
  const isViewMode = formType === "view";

  const pageMeta = useMemo(() => {
    if (formType === "edit") return { title: "Editar Ação", icon: Pencil };
    if (formType === "view") return { title: "Visualizar Ação", icon: Eye };
    return { title: "Cadastrar Rifa", icon: Plus };
  }, [formType]);

  const needsId = formType === "edit" || formType === "view";
  const shouldFetch = needsId && Boolean(raffleId);

  const {
    data: rifaData,
    isLoading: isLoadingGet,
    error: errorGet,
  } = useGetRifaById(shouldFetch ? (raffleId as string) : "");

  const {
    mutate: postRifa,
    isPending,
    isSuccess: isSuccessPost,
    error: errorPost,
  } = usePostRifa();

  const {
    mutate: putRifa,
    isPending: isPendingPut,
    isSuccess: isSuccessPut,
    error: errorPut,
  } = usePutRifa();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<RifaFormData>({
    resolver: zodResolver(rifaFormSchema),
    defaultValues: {
      title: "",
      description: "",
      numberOfShares: 0,
      quotaPrice: 0,
      minPurchaseShares: 0,
      maxPurchaseShares: 0,
      descriptionAward: "",
      showQuotas: true, // ✅ default (ajuste conforme regra do produto)
      cover: [],
      images: [],
      standardSalesPercentage: undefined,
    },
  });

  const [dateRifa, setDateRifa] = useState(false);
  const [completedRifa, setCompletedRifa] = useState(true);

  const handleDateRifa = () => {
    setDateRifa(true);
    setCompletedRifa(false);
  };

  const handleCompletedRifa = () => {
    setCompletedRifa(true);
    setDateRifa(false);
  };

  useEffect(() => {
    if (!rifaData) return;

    reset({
      ...rifaData,
      cover: rifaData.cover ? [rifaData.cover] : [],
      images: Array.isArray(rifaData.images) ? rifaData.images : [],
    });
  }, [rifaData, reset]);

  useEffect(() => {
    if (isSuccessPut || isSuccessPost) navigate("/panel");
  }, [isSuccessPut, isSuccessPost, navigate]);

  useEffect(() => {
    if (errorPost || errorPut || errorGet) {
      const errorMessage =
        (errorPost as any)?.response?.data?.message ||
        (errorPut as any)?.response?.data?.message ||
        (errorGet as any)?.response?.data?.message ||
        "Ocorreu algum erro!";
      setCustomDialog({
        message: errorMessage,
        title: "Erro",
        type: "error",
        closeHandler: () => setCustomDialog({}),
      });
    }
  }, [errorPost, errorPut, errorGet, setCustomDialog]);

  const coverFiles = watch("cover");
  const imagesFiles = watch("images");

  const submitForm = (data: RifaFormData) => {
    const formData = buildRifaFormData(data);

    if (formType === "edit") {
      putRifa({ rifa: formData, id: raffleId ?? "" });
      return;
    }

    postRifa(formData);
  };

  if (isPending || isPendingPut || isLoadingGet) return <Loading />;

  const Icon = pageMeta.icon;

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
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
                  Preencha os detalhes e publique uma campanha de sorteio
                  beneficente.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <BadgeCheck className="h-4 w-4 text-green-700" />
              <span>Transparência e organização</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-green-200 bg-white p-6">
          <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
            <div>
              <Field>
                <FieldLabel htmlFor="title">Título</FieldLabel>
                <Input
                  id="title"
                  className="my-3"
                  {...register("title")}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.title)}
                />
                {errors.title?.message && (
                  <FieldError>{errors.title.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Descrição</FieldLabel>
                <Textarea
                  placeholder="Descrição da ação"
                  {...register("description")}
                  disabled={isViewMode}
                  notification={{
                    isError: Boolean(errors.description),
                    notification: errors.description?.message,
                  }}
                />
              </Field>
            </div>

            {/* ✅ showQuotas */}
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
              <p className="mb-4 font-medium text-gray-900">
                Agendamento do sorteio
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <Label>Informar data de sorteio</Label>
                    <Switch
                      className="ml-3"
                      checked={dateRifa}
                      onCheckedChange={handleDateRifa}
                      disabled={isViewMode}
                    />
                  </div>

                  {!completedRifa && (
                    <div className="mt-4">
                      <DataInput label="Data de sorteio" />
                    </div>
                  )}
                </div>

                <div className="rounded-lg border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <Label>Sortear após realizar as vendas</Label>
                    <Switch
                      className="ml-3"
                      checked={completedRifa}
                      onCheckedChange={handleCompletedRifa}
                      disabled={isViewMode}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    O sorteio é realizado quando a campanha atingir o objetivo.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="numberOfShares">
                  Quantidade de Cotas
                </FieldLabel>
                <Input
                  id="numberOfShares"
                  className="w-full"
                  type="number"
                  {...register("numberOfShares", { valueAsNumber: true })}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.numberOfShares)}
                />
                {errors.numberOfShares?.message && (
                  <FieldError>{errors.numberOfShares.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="quotaPrice">Valor por cota</FieldLabel>
                <Input
                  id="quotaPrice"
                  className="w-full"
                  {...register("quotaPrice", { valueAsNumber: true })}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.quotaPrice)}
                />
                {errors.quotaPrice?.message && (
                  <FieldError>{errors.quotaPrice.message}</FieldError>
                )}
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="compraMinCotas">
                  Compra mínima de cotas por venda
                </FieldLabel>
                <Input
                  id="compraMinCotas"
                  className="w-full"
                  type="number"
                  {...register("minPurchaseShares", { valueAsNumber: true })}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.minPurchaseShares)}
                />
                {errors.minPurchaseShares?.message && (
                  <FieldError>{errors.minPurchaseShares.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="compraMaxCotas">
                  Compra máxima de cotas por venda
                </FieldLabel>
                <Input
                  id="compraMaxCotas"
                  className="w-full"
                  type="number"
                  {...register("maxPurchaseShares", { valueAsNumber: true })}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.maxPurchaseShares)}
                />
                {errors.maxPurchaseShares?.message && (
                  <FieldError>{errors.maxPurchaseShares.message}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="standardSalesPercentage">
                  Percentual padrão de vendas (%)
                </FieldLabel>

                <Input
                  id="standardSalesPercentage"
                  className="w-full"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Ex.: 10"
                  {...register("standardSalesPercentage", {
                    setValueAs: (v) => {
                      if (v === "" || v === null || v === undefined)
                        return undefined;
                      const n = Number(v);
                      return Number.isFinite(n) ? n : undefined;
                    },
                  })}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.standardSalesPercentage)}
                />

                {errors.standardSalesPercentage?.message && (
                  <FieldError>
                    {errors.standardSalesPercentage.message}
                  </FieldError>
                )}

                <p className="mt-1 text-xs text-gray-600">
                  Informe de 0 a 100. Deixe em branco para não aplicar
                  percentual padrão.
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

                {errors.descriptionAward?.message && (
                  <FieldError>{errors.descriptionAward.message}</FieldError>
                )}
              </Field>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                  <p className="mb-2 font-medium text-gray-900">
                    Imagem de capa
                  </p>
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
                  <p className="mb-2 font-medium text-gray-900">
                    Imagens do prêmio
                  </p>
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
                <Button type="submit">
                  {formType === "edit" ? "Editar Ação" : "Cadastrar Ação"}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RifaForm;
