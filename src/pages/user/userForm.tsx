import { Button } from "@/components/button/button";
import { useCustomDialogContext } from "@/components/dialog/useCustomDialogContext";
import { Input } from "@/components/input/input";
import { useGetCEP } from "@/lib/api/tanstackQuery/cep";
import {
  useGetPessoaById,
  usePostPessoa,
  usePutPessoa,
} from "@/lib/api/tanstackQuery/pessoa";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Path, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import Loading from "@/components/loading";
import {
  BadgeCheck,
  Eye,
  Pencil,
  Plus,
  MapPin,
  Mail,
  Phone,
  IdCard,
  CalendarDays,
} from "lucide-react";

const FORM_TYPES = ["create", "edit", "view"] as const;
type FormType = (typeof FORM_TYPES)[number];

const isFormType = (v: unknown): v is FormType =>
  typeof v === "string" && (FORM_TYPES as readonly string[]).includes(v);

const enderecoSchema = z.object({
  cep: z.string().trim().min(1, "CEP é obrigatório"),
  estado: z.string().trim().min(1, "Estado é obrigatório"),
  cidade: z.string().trim().min(1, "Cidade é obrigatória"),
  rua: z.string().trim().min(1, "Rua é obrigatória"),
  numero: z.string().trim().min(1, "Número é obrigatório"),
  bairro: z.string().trim().min(1, "Bairro é obrigatório"),
  complemento: z.string().optional().default(""),
});

const usuarioSchema = z.object({
  nomeCompleto: z.string().trim().min(1, "Nome completo é obrigatório"),
  dataNascimento: z.string().trim().min(1, "Data de nascimento é obrigatória"),
  cpf: z.string().trim().min(1, "CPF é obrigatório"),
  rg: z.string().trim().min(1, "RG é obrigatório"),
  telefoneCelular: z.string().trim().min(1, "Telefone celular é obrigatório"),
  email: z
    .string()
    .trim()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  endereco: enderecoSchema,
});

type UsuarioFormValues = z.infer<typeof usuarioSchema>;

const defaultValues: UsuarioFormValues = {
  nomeCompleto: "",
  dataNascimento: "",
  cpf: "",
  rg: "",
  telefoneCelular: "",
  email: "",
  endereco: {
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
  const formData = new FormData();
  formData.append(
    "form",
    new Blob([JSON.stringify(values)], { type: "application/json" })
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
  const { data: dataCep } = useGetCEP(cep);

  const {
    data: dataUsuario,
    isLoading: isLoadingGet,
    error: errorGet,
  } = useGetPessoaById(shouldFetch ? (userId as string) : "");

  const {
    mutate: postUsuario,
    isPending: isPendingPost,
    isSuccess: isSuccessPost,
    error: errorPost,
  } = usePostPessoa();

  const {
    mutate: putUsuario,
    isPending: isPendingPut,
    isSuccess: isSuccessPut,
    error: errorPut,
  } = usePutPessoa();

  const {
    setValue,
    reset,
    watch,
    trigger,
    formState: { errors },
  } = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    mode: "onBlur",
    defaultValues,
    shouldUnregister: false,
  });

  const formValues = watch();

  const handleChange = <TPath extends Path<UsuarioFormValues>>(
    path: TPath,
    value: any
  ) => setValue(path, value, { shouldDirty: true });

  const validateField = async <TPath extends Path<UsuarioFormValues>>(
    path: TPath
  ) => {
    await trigger(path);
  };

  const validateForm = async () => await trigger();

  useEffect(() => {
    if (!dataUsuario) return;

    const merged: UsuarioFormValues = {
      ...defaultValues,
      ...dataUsuario,
      endereco: { ...defaultValues.endereco, ...(dataUsuario as any).endereco },
    };

    reset(merged, { keepDirty: false, keepTouched: false });
  }, [dataUsuario, reset]);

  useEffect(() => {
    if (!dataCep) return;

    handleChange("endereco.estado", dataCep.uf ?? "");
    handleChange("endereco.bairro", dataCep.bairro ?? "");
    handleChange("endereco.cidade", dataCep.localidade ?? "");
    handleChange("endereco.rua", dataCep.logradouro ?? "");

    void trigger([
      "endereco.estado",
      "endereco.bairro",
      "endereco.cidade",
      "endereco.rua",
    ]);
  }, [dataCep, trigger]);

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
    [isPendingPost, isPendingPut, isLoadingGet]
  );

  const submitForm = async () => {
    const ok = await validateForm();
    if (!ok) return;
    postUsuario(buildUsuarioFormData(formValues));
  };

  const updateForm = async () => {
    const ok = await validateForm();
    if (!ok) return;
    putUsuario({ pessoa: buildUsuarioFormData(formValues), id: userId ?? "" });
  };

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
              <Input
                label="Nome Completo"
                value={formValues.nomeCompleto}
                onChange={(e) => handleChange("nomeCompleto", e.target.value)}
                onBlur={() => validateField("nomeCompleto")}
                disabled={isViewMode}
                notification={{
                  isError: Boolean(errors.nomeCompleto?.message),
                  notification: errors.nomeCompleto?.message ?? "",
                }}
              />

              <Input
                label="Data de Nascimento"
                type="date"
                value={formValues.dataNascimento}
                onChange={(e) => handleChange("dataNascimento", e.target.value)}
                onBlur={() => validateField("dataNascimento")}
                disabled={isViewMode}
                notification={{
                  isError: Boolean(errors.dataNascimento?.message),
                  notification: errors.dataNascimento?.message ?? "",
                }}
              />

              <Input
                label="CPF"
                value={formValues.cpf}
                onChange={(e) => handleChange("cpf", e.target.value)}
                onBlur={() => validateField("cpf")}
                disabled={isViewMode}
                notification={{
                  isError: Boolean(errors.cpf?.message),
                  notification: errors.cpf?.message ?? "",
                }}
              />

              <Input
                label="RG"
                value={formValues.rg}
                onChange={(e) => handleChange("rg", e.target.value)}
                onBlur={() => validateField("rg")}
                disabled={isViewMode}
                notification={{
                  isError: Boolean(errors.rg?.message),
                  notification: errors.rg?.message ?? "",
                }}
              />

              <Input
                label="Telefone Celular"
                value={formValues.telefoneCelular}
                onChange={(e) =>
                  handleChange("telefoneCelular", e.target.value)
                }
                onBlur={() => validateField("telefoneCelular")}
                disabled={isViewMode}
                notification={{
                  isError: Boolean(errors.telefoneCelular?.message),
                  notification: errors.telefoneCelular?.message ?? "",
                }}
              />

              <Input
                label="Email"
                type="email"
                value={formValues.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => validateField("email")}
                disabled={isViewMode}
                notification={{
                  isError: Boolean(errors.email?.message),
                  notification: errors.email?.message ?? "",
                }}
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="rounded-xl border border-green-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-700" />
              <h2 className="text-xl font-semibold text-gray-900">Endereço</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                disabled={isViewMode}
                label="CEP"
                value={formValues.endereco.cep}
                onChange={(e) => {
                  handleChange("endereco.cep", e.target.value);
                  setCep(e.target.value);
                }}
                onBlur={() => validateField("endereco.cep")}
                notification={{
                  isError: Boolean(errors.endereco?.cep?.message),
                  notification: errors.endereco?.cep?.message ?? "",
                }}
              />

              <Input
                disabled={isViewMode}
                label="Estado"
                value={formValues.endereco.estado}
                onChange={(e) =>
                  handleChange("endereco.estado", e.target.value)
                }
                onBlur={() => validateField("endereco.estado")}
                notification={{
                  isError: Boolean(errors.endereco?.estado?.message),
                  notification: errors.endereco?.estado?.message ?? "",
                }}
              />

              <Input
                disabled={isViewMode}
                label="Cidade"
                value={formValues.endereco.cidade}
                onChange={(e) =>
                  handleChange("endereco.cidade", e.target.value)
                }
                onBlur={() => validateField("endereco.cidade")}
                notification={{
                  isError: Boolean(errors.endereco?.cidade?.message),
                  notification: errors.endereco?.cidade?.message ?? "",
                }}
              />

              <Input
                disabled={isViewMode}
                label="Rua"
                className="sm:col-span-2"
                value={formValues.endereco.rua}
                onChange={(e) => handleChange("endereco.rua", e.target.value)}
                onBlur={() => validateField("endereco.rua")}
                notification={{
                  isError: Boolean(errors.endereco?.rua?.message),
                  notification: errors.endereco?.rua?.message ?? "",
                }}
              />

              <Input
                disabled={isViewMode}
                label="Número"
                value={formValues.endereco.numero}
                onChange={(e) =>
                  handleChange("endereco.numero", e.target.value)
                }
                onBlur={() => validateField("endereco.numero")}
                notification={{
                  isError: Boolean(errors.endereco?.numero?.message),
                  notification: errors.endereco?.numero?.message ?? "",
                }}
              />

              <Input
                disabled={isViewMode}
                label="Bairro"
                value={formValues.endereco.bairro}
                onChange={(e) =>
                  handleChange("endereco.bairro", e.target.value)
                }
                onBlur={() => validateField("endereco.bairro")}
                notification={{
                  isError: Boolean(errors.endereco?.bairro?.message),
                  notification: errors.endereco?.bairro?.message ?? "",
                }}
              />

              <Input
                disabled={isViewMode}
                label="Complemento"
                className="sm:col-span-2"
                value={formValues.endereco.complemento}
                onChange={(e) =>
                  handleChange("endereco.complemento", e.target.value)
                }
                onBlur={() => validateField("endereco.complemento")}
                notification={{
                  isError: Boolean(errors.endereco?.complemento?.message),
                  notification: errors.endereco?.complemento?.message ?? "",
                }}
              />
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
