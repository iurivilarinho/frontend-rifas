import { Button } from "@/components/button/button";
import DragAndDrop from "@/components/dragAndDrop/dragAndDrop";
import DataInput from "@/components/input/dateInput";
import { Input } from "@/components/input/input";
import { Label } from "@/components/input/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetRifaById,
  usePostRifa,
  usePutRifa,
} from "@/lib/api/tanstackQuery/rifa";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import Loading from "@/components/loading";
import { useCustomDialogContext } from "@/components/dialog/useCustomDialogContext";
import { BadgeCheck, Eye, Pencil, Plus } from "lucide-react";

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
  compraMinCotas: z.number().positive("A compra mínima deve ser positiva"),
  compraMaxCotas: z.number().positive("A compra máxima deve ser positiva"),
  descriptionAward: z.string().min(1, "A descrição da premiação é obrigatória"),
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
  const { images, ...props } = data;

  if (images) {
    if (Array.isArray(images)) {
      images.forEach((file) => {
        if (file?.documento)
          formData.append("files", convertDocumentToFile(file));
        else formData.append("files", file);
      });
    } else {
      if ((images as any)?.documento)
        formData.append("file", convertDocumentToFile(images));
      else formData.append("file", images);
    }
  }

  formData.append(
    "form",
    new Blob([JSON.stringify(props)], { type: "application/json" })
  );
  return formData;
};

const RifaForm = () => {
  const navigate = useNavigate();
  const { setCustomDialog } = useCustomDialogContext();
  const params = useParams();
  const formTypeParam = params.formType;
  const rifaId = params.rifaId;

  const formType: FormType = isFormType(formTypeParam)
    ? formTypeParam
    : "create";
  const isViewMode = formType === "view";

  const pageMeta = useMemo(() => {
    if (formType === "edit") return { title: "Editar Rifa", icon: Pencil };
    if (formType === "view") return { title: "Visualizar Rifa", icon: Eye };
    return { title: "Cadastrar Rifa", icon: Plus };
  }, [formType]);

  const needsId = formType === "edit" || formType === "view";
  const shouldFetch = needsId && Boolean(rifaId);

  const {
    data: rifaData,
    isLoading: isLoadingGet,
    error: errorGet,
  } = useGetRifaById(shouldFetch ? (rifaId as string) : "");

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
    formState: { errors },
    reset,
  } = useForm<RifaFormData>({
    resolver: zodResolver(rifaFormSchema),
    defaultValues: {
      title: "",
      description: "",
      numberOfShares: 0,
      quotaPrice: 0,
      compraMinCotas: 0,
      compraMaxCotas: 0,
      descriptionAward: "",
      images: [],
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
    if (rifaData) reset(rifaData);
  }, [rifaData, reset]);

  useEffect(() => {
    if (isSuccessPut || isSuccessPost) navigate("/");
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

  const submitForm = (data: RifaFormData) => {
    const formData = buildRifaFormData(data);

    if (formType === "edit") {
      putRifa({ rifa: formData, id: rifaId ?? "" });
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
              <Input
                className="my-3"
                label="Título"
                {...register("title")}
                disabled={isViewMode}
                notification={{
                  isError: Boolean(errors.title),
                  notification: errors.title?.message,
                }}
              />
              <Textarea
                placeholder="Descrição da rifa"
                {...register("description")}
                disabled={isViewMode}
                notification={{
                  isError: Boolean(errors.description),
                  notification: errors.description?.message,
                }}
              />
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
              <Input
                className="w-full"
                label="Quantidade de Cotas"
                type="number"
                {...register("numberOfShares", { valueAsNumber: true })}
                disabled={isViewMode}
                notification={{
                  isError: Boolean(errors.numberOfShares),
                  notification: errors.numberOfShares?.message,
                }}
              />

              <Input
                className="w-full"
                label="Valor por cota"
                {...register("quotaPrice", { valueAsNumber: true })}
                disabled={isViewMode}
                notification={{
                  isError: Boolean(errors.quotaPrice),
                  notification: errors.quotaPrice?.message,
                }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                className="w-full"
                label="Compra mínima de cotas por venda"
                type="number"
                {...register("compraMinCotas", { valueAsNumber: true })}
                disabled={isViewMode}
                notification={{
                  isError: Boolean(errors.compraMinCotas),
                  notification: errors.compraMinCotas?.message,
                }}
              />

              <Input
                className="w-full"
                label="Compra máxima de cotas por venda"
                type="number"
                {...register("compraMaxCotas", { valueAsNumber: true })}
                disabled={isViewMode}
                notification={{
                  isError: Boolean(errors.compraMaxCotas),
                  notification: errors.compraMaxCotas?.message,
                }}
              />
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Detalhes do prêmio
              </h2>

              <Textarea
                className="my-3"
                label="Descrição da premiação"
                placeholder="Descrição da premiação"
                {...register("descriptionAward")}
                disabled={isViewMode}
                notification={{
                  isError: Boolean(errors.descriptionAward),
                  notification: errors.descriptionAward?.message,
                }}
              />

              <DragAndDrop
                initialFiles={rifaData?.images}
                onAddFile={(files) =>
                  setValue("images", files, { shouldValidate: true })
                }
                label="Imagens do Prêmio"
                acceptedFileTypes={{
                  ".jpg": ["image/jpeg"],
                  ".jpeg": ["image/jpeg"],
                  ".png": ["image/png"],
                }}
                notification={{
                  isError: Boolean(errors.images),
                  notification: String(errors.images?.message ?? ""),
                }}
                //disabled={isViewMode}
              />
            </div>

            {!isViewMode && (
              <div className="flex justify-end">
                <Button type="submit">
                  {formType === "edit" ? "Editar Rifa" : "Cadastrar Rifa"}
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
