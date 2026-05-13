import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
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
import { z } from "zod";

import { Button } from "@/components/button/Button";
import { Field, FieldError, FieldLabel } from "@/components/input/base/Field";
import { Input } from "@/components/input/base/Input";
import { Loading } from "@/components/Loading";
import { useGetCep } from "@/features/cep";
import { isFormType, type FormType } from "@/types/formType";
import { isValidCPF } from "@/utils/validations";

import { useGetUserById } from "../api/services/useUserService";
import { useUserFormSubmit } from "../hooks/useUserFormSubmit";

const addressSchema = z.object({
  cep: z.string().trim().min(1, "CEP é obrigatório"),
  estado: z.string().trim().min(1, "Estado é obrigatório"),
  cidade: z.string().trim().min(1, "Cidade é obrigatória"),
  rua: z.string().trim().min(1, "Rua é obrigatória"),
  numero: z.string().trim().min(1, "Número é obrigatório"),
  bairro: z.string().trim().min(1, "Bairro é obrigatório"),
  complemento: z.string().optional(),
});

const userFormSchema = z.object({
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

export type UserFormValues = z.infer<typeof userFormSchema>;

const DEFAULT_USER_FORM_VALUES: UserFormValues = {
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

export const UserFormPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const formType: FormType = isFormType(params.formType) ? params.formType : "create";
  const userId = params.userId;
  const isViewMode = formType === "view";
  const needsId = formType === "edit" || formType === "view";

  const pageMeta = useMemo(() => {
    if (formType === "edit") return { title: "Editar Usuário", icon: Pencil };
    if (formType === "view") return { title: "Visualizar Usuário", icon: Eye };
    return { title: "Cadastrar Usuário", icon: Plus };
  }, [formType]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: DEFAULT_USER_FORM_VALUES,
    mode: "onBlur",
  });

  const cepValue = watch("address.cep");
  const { data: cepData } = useGetCep(cepValue ?? "");

  const { data: userData, isLoading: isLoadingUser } = useGetUserById(
    needsId ? userId : undefined,
  );

  const { handleSubmit: submitUser, isLoading: isSaving } = useUserFormSubmit({
    id: userId,
    formType,
    onSuccess: () => navigate("/panel?tab=users"),
  });

  useEffect(() => {
    if (userData) {
      reset({
        name: userData.name ?? "",
        dateOfBirth: userData.dateOfBirth ?? "",
        cpf: userData.cpf ?? "",
        rg: userData.rg ?? "",
        personalPhone: userData.personalPhone ?? "",
        email: userData.email ?? "",
        address: {
          ...DEFAULT_USER_FORM_VALUES.address,
          ...(userData.address ?? {}),
        },
      });
    }
  }, [userData, reset]);

  useEffect(() => {
    if (!cepData || cepData.erro) return;
    setValue("address.estado", cepData.uf ?? "");
    setValue("address.cidade", cepData.localidade ?? "");
    setValue("address.bairro", cepData.bairro ?? "");
    setValue("address.rua", cepData.logradouro ?? "");
  }, [cepData, setValue]);

  if (isLoadingUser) return <Loading />;

  const Icon = pageMeta.icon;
  const ctaLabel = formType === "edit" ? "Salvar" : "Cadastrar";

  return (
    <div className="min-h-screen min-h-[100dvh] bg-green-50 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
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

        <form onSubmit={handleSubmit(submitUser)} className="grid gap-6">
          <div className="rounded-xl border border-green-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <IdCard className="h-5 w-5 text-green-700" />
              <h2 className="text-xl font-semibold text-gray-900">Dados do Usuário</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">Nome Completo</FieldLabel>
                <Input
                  id="name"
                  {...register("name")}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="dateOfBirth">Data de Nascimento</FieldLabel>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.dateOfBirth)}
                />
                {errors.dateOfBirth && (
                  <FieldError>{errors.dateOfBirth.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="cpf">CPF</FieldLabel>
                <Input
                  id="cpf"
                  {...register("cpf")}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.cpf)}
                />
                {errors.cpf && <FieldError>{errors.cpf.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="rg">RG</FieldLabel>
                <Input
                  id="rg"
                  {...register("rg")}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.rg)}
                />
                {errors.rg && <FieldError>{errors.rg.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="personalPhone">Telefone Celular</FieldLabel>
                <Input
                  id="personalPhone"
                  {...register("personalPhone")}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.personalPhone)}
                />
                {errors.personalPhone && (
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
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <FieldError>{errors.email.message}</FieldError>}
              </Field>
            </div>
          </div>

          <div className="rounded-xl border border-green-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-700" />
              <h2 className="text-xl font-semibold text-gray-900">Endereço</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="address.cep">CEP</FieldLabel>
                <Input
                  id="address.cep"
                  {...register("address.cep")}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.address?.cep)}
                />
                {errors.address?.cep && (
                  <FieldError>{errors.address.cep.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="address.estado">Estado</FieldLabel>
                <Input
                  id="address.estado"
                  {...register("address.estado")}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.address?.estado)}
                />
                {errors.address?.estado && (
                  <FieldError>{errors.address.estado.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="address.cidade">Cidade</FieldLabel>
                <Input
                  id="address.cidade"
                  {...register("address.cidade")}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.address?.cidade)}
                />
                {errors.address?.cidade && (
                  <FieldError>{errors.address.cidade.message}</FieldError>
                )}
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="address.rua">Rua</FieldLabel>
                <Input
                  id="address.rua"
                  {...register("address.rua")}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.address?.rua)}
                />
                {errors.address?.rua && (
                  <FieldError>{errors.address.rua.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="address.numero">Número</FieldLabel>
                <Input
                  id="address.numero"
                  {...register("address.numero")}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.address?.numero)}
                />
                {errors.address?.numero && (
                  <FieldError>{errors.address.numero.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="address.bairro">Bairro</FieldLabel>
                <Input
                  id="address.bairro"
                  {...register("address.bairro")}
                  disabled={isViewMode}
                  aria-invalid={Boolean(errors.address?.bairro)}
                />
                {errors.address?.bairro && (
                  <FieldError>{errors.address.bairro.message}</FieldError>
                )}
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="address.complemento">Complemento</FieldLabel>
                <Input
                  id="address.complemento"
                  {...register("address.complemento")}
                  disabled={isViewMode}
                />
              </Field>
            </div>
          </div>

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
                  <p className="text-gray-600">Email e telefone para comunicação.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-green-700 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Telefone</p>
                  <p className="text-gray-600">Usado para suporte e confirmações.</p>
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

          {!isViewMode && (
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : ctaLabel}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
