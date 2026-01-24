import { Button } from "@/components/button/button";
import { useCustomDialogContext } from "@/components/dialog/useCustomDialogContext";
import { Field, FieldError, FieldLabel } from "@/components/input/Field";
import { Input } from "@/components/input/Input";
import Loading from "@/components/Loading";
import { useGetCEP } from "@/lib/api/tanstackQuery/cep";
import {
  useGetUserById,
  usePostUser,
  usePutUser,
} from "@/lib/api/tanstackQuery/user";
import { isValidCPF } from "@/utils/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeCheck,
  CalendarDays,
  Eye,
  IdCard,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

const FORM_TYPES = ["create", "edit", "view"] as const;
type FormType = (typeof FORM_TYPES)[number];

const isFormType = (v: unknown): v is FormType =>
  typeof v === "string" && (FORM_TYPES as readonly string[]).includes(v);

const addressSchema = z.object({
  cep: z.string().trim().min(1, "CEP é obrigatório"),
  estado: z.string().trim().min(1, "Estado é obrigatório"),
  cidade: z.string().trim().min(1, "Cidade é obrigatória"),
  rua: z.string().trim().min(1, "Rua é obrigatória"),
  numero: z.string().trim().min(1, "Número é obrigatório"),
  bairro: z.string().trim().min(1, "Bairro é obrigatório"),
  complemento: z.string().optional(),
});

const usuarioSchema = z.object({
  name: z.string().trim().min(1, "Nome completo é obrigatório"),
  dateOfBirth: z.string().trim().min(1, "Data de nascimento é obrigatória"),
  cpf: z
    .string()
    .trim()
    .min(1, "CPF é obrigatório")
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => isValidCPF(v), "CPF inválido"),

  rg: z.string().trim().min(1, "RG é obrigatório"),
  personalPhone: z.string().trim().min(1, "Telefone celular é obrigatório"),
  email: z.email("Email inválido"),
  address: addressSchema,
});

type UsuarioFormValues = z.infer<typeof usuarioSchema>;

const defaultValues: UsuarioFormValues = {
  name: "",
  dateOfBirth: "",
  cpf: "",
  rg: "",
  personalPhone: "",
  email: "",
  address: {
    cep: "",
    estado: "",
    cidade: "",
    rua: "",
    numero: "",
    bairro: "",
    complemento: "",
  },
};

function buildUsuarioFormData(values: UsuarioFormValues) {
  console.log("cpf", values.cpf);
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(values)], { type: "application/json" }),
  );
  return formData;
}

const UserForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { setCustomDialog } = useCustomDialogContext();

  const formType: FormType = isFormType(params.formType)
    ? params.formType
    : "create";
  const userId = params.userId;

  const isViewMode = formType === "view";
  const needsId = formType === "edit" || formType === "view";
  const shouldFetch = needsId && Boolean(userId);

  const pageMeta = useMemo(() => {
    if (formType === "edit") return { title: "Editar Usuário", icon: Pencil };
    if (formType === "view") return { title: "Visualizar Usuário", icon: Eye };
    return { title: "Cadastrar Usuário", icon: Plus };
  }, [formType]);

  const ctaLabel = useMemo(() => {
    if (formType === "edit") return "Salvar";
    if (formType === "create") return "Cadastrar";
    return "";
  }, [formType]);

  const [cep, setCep] = useState("");
  const cepDigits = cep.replace(/\D/g, "");

  const { data: dataCep } = useGetCEP(cepDigits);

  const {
    data: dataUsuario,
    isLoading: isLoadingGet,
    error: errorGet,
  } = useGetUserById(userId as string, { enabled: shouldFetch });

  const {
    mutate: postUsuario,
    isPending: isPendingPost,
    isSuccess: isSuccessPost,
    error: errorPost,
  } = usePostUser();

  const {
    mutate: putUsuario,
    isPending: isPendingPut,
    isSuccess: isSuccessPut,
    error: errorPut,
  } = usePutUser();

  const {
    reset,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    mode: "onBlur",
    defaultValues,
    shouldUnregister: false,
  });

  const submitForm = handleSubmit((values) => {
    console.log("cpf", values.cpf); // só números
    postUsuario(buildUsuarioFormData(values));
  });

  const updateForm = handleSubmit((values) => {
    console.log("cpf", values.cpf); // só números
    putUsuario({ user: buildUsuarioFormData(values), id: userId ?? "" });
  });

  useEffect(() => {
    if (!dataUsuario) return;

    const merged: UsuarioFormValues = {
      ...defaultValues,
      ...dataUsuario,
      address: { ...defaultValues.address, ...(dataUsuario as any).address },
    };

    reset(merged, { keepDirty: false, keepTouched: false });
  }, [dataUsuario, reset]);
  useEffect(() => {
    if (!dataCep) return;

    setValue("address.estado", dataCep.uf ?? "", { shouldDirty: true });
    setValue("address.cidade", dataCep.localidade ?? "", { shouldDirty: true });
    setValue("address.bairro", dataCep.bairro ?? "", { shouldDirty: true });
    setValue("address.rua", dataCep.logradouro ?? "", { shouldDirty: true });
  }, [dataCep, setValue]);

  useEffect(() => {
    if (isSuccessPost || isSuccessPut) navigate("/");
  }, [isSuccessPost, isSuccessPut, navigate]);

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

  const isLoading = useMemo(
    () => isPendingPost || isPendingPut || isLoadingGet,
    [isPendingPost, isPendingPut, isLoadingGet],
  );

  const handlePrimaryAction = () =>
    formType === "edit" ? updateForm() : submitForm();

  if (isLoading) return <Loading />;

  const Icon = pageMeta.icon;

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Header */}
        <div className="rounded-xl border border-green-200 bg-white p-6">
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
                  Dados essenciais para cadastro e participação nas campanhas.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <BadgeCheck className="h-4 w-4 text-green-700" />
              <span>Validação automática</span>
            </div>
          </div>
        </div>

        {/* Conteúdo (ordem: Dados -> Endereço -> Resumo) */}
        <div className="grid gap-6">
          {/* Dados do usuário */}
          <div className="rounded-xl border border-green-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <IdCard className="h-5 w-5 text-green-700" />
              <h2 className="text-xl font-semibold text-gray-900">
                Dados do Usuário
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">Nome Completo</FieldLabel>
                <Input
                  id="name"
                  {...register("name")}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.name?.message)}
                />
                {errors.name?.message && (
                  <FieldError>{errors.name.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="dateOfBirth">
                  Data de Nascimento
                </FieldLabel>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.dateOfBirth?.message)}
                />
                {errors.dateOfBirth?.message && (
                  <FieldError>{errors.dateOfBirth.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="cpf">CPF</FieldLabel>
                <Input
                  id="cpf"
                  {...register("cpf")}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.cpf?.message)}
                />
                {errors.cpf?.message && (
                  <FieldError>{errors.cpf.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="rg">RG</FieldLabel>
                <Input
                  id="rg"
                  {...register("rg")}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.rg?.message)}
                />
                {errors.rg?.message && (
                  <FieldError>{errors.rg.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="personalPhone">
                  Telefone Celular
                </FieldLabel>
                <Input
                  id="personalPhone"
                  {...register("personalPhone")}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.personalPhone?.message)}
                />
                {errors.personalPhone?.message && (
                  <FieldError>{errors.personalPhone.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.email?.message)}
                />
                {errors.email?.message && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </Field>
            </div>
          </div>

          {/* Endereço */}
          <div className="rounded-xl border border-green-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-700" />
              <h2 className="text-xl font-semibold text-gray-900">Endereço</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="address_cep">CEP</FieldLabel>
                <Input
                  id="address_cep"
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.address?.cep?.message)}
                  {...register("address.cep", {
                    onChange: (e) => setCep(e.target.value),
                  })}
                />

                {errors.address?.cep?.message && (
                  <FieldError>{errors.address.cep.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="address_estado">Estado</FieldLabel>
                <Input
                  id="address_estado"
                  disabled={isViewMode}
                  {...register("address.estado")}
                  aria-invalid={Boolean(errors.address?.estado?.message)}
                />
                {errors.address?.estado?.message && (
                  <FieldError>{errors.address.estado.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="address_cidade">Cidade</FieldLabel>
                <Input
                  id="address_cidade"
                  disabled={isViewMode}
                  {...register("address.cidade")}
                  aria-invalid={Boolean(errors.address?.cidade?.message)}
                />
                {errors.address?.cidade?.message && (
                  <FieldError>{errors.address.cidade.message}</FieldError>
                )}
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="address_rua">Rua</FieldLabel>
                <Input
                  id="address_rua"
                  disabled={isViewMode}
                  className="sm:col-span-2"
                  {...register("address.rua")}
                  aria-invalid={Boolean(errors.address?.rua?.message)}
                />
                {errors.address?.rua?.message && (
                  <FieldError>{errors.address.rua.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="address_numero">Número</FieldLabel>
                <Input
                  id="address_numero"
                  disabled={isViewMode}
                  {...register("address.numero")}
                  aria-invalid={Boolean(errors.address?.numero?.message)}
                />
                {errors.address?.numero?.message && (
                  <FieldError>{errors.address.numero.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="address_bairro">Bairro</FieldLabel>
                <Input
                  id="address_bairro"
                  disabled={isViewMode}
                  {...register("address.bairro")}
                  aria-invalid={Boolean(errors.address?.bairro?.message)}
                />
                {errors.address?.bairro?.message && (
                  <FieldError>{errors.address.bairro.message}</FieldError>
                )}
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="address_complemento">
                  Complemento
                </FieldLabel>
                <Input
                  id="address_complemento"
                  disabled={isViewMode}
                  className="sm:col-span-2"
                  {...register("address.complemento")}
                  aria-invalid={Boolean(errors.address?.complemento?.message)}
                />
                {errors.address?.complemento?.message && (
                  <FieldError>{errors.address.complemento.message}</FieldError>
                )}
              </Field>
            </div>
          </div>

          {/* Resumo (embaixo) */}
          <div className="rounded-xl border border-green-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-green-700" />
              <h2 className="text-xl font-semibold text-gray-900">Resumo</h2>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-green-700 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Contato</p>
                  <p className="text-gray-600">
                    Email e telefone para comunicação.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-green-700 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Telefone</p>
                  <p className="text-gray-600">
                    Usado para suporte e confirmações.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="h-4 w-4 text-green-700 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Dados pessoais</p>
                  <p className="text-gray-600">
                    Validação para evitar inconsistências.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-green-700 mt-0.5" />
                  <p className="text-green-900">
                    Preencha o CEP para autopreencher o endereço.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ÚNICO botão (só aqui) */}
        {!isViewMode && (
          <div className="flex justify-end">
            <Button onClick={handlePrimaryAction} disabled={isLoading}>
              {isLoading ? "Enviando..." : ctaLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserForm;
