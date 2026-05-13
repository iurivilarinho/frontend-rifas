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
import { SectionCard, SectionCardHeader } from "@/components/card/SectionCard";
import { Field, FieldError, FieldLabel } from "@/components/input/base/Field";
import { Input } from "@/components/input/base/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
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
    if (formType === "edit") return { title: "Editar usuário", icon: Pencil };
    if (formType === "view") return { title: "Visualizar usuário", icon: Eye };
    return { title: "Cadastrar usuário", icon: Plus };
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

  const ctaLabel = formType === "edit" ? "Salvar" : "Cadastrar";

  return (
    <PageShell maxWidth="5xl">
      <PageHeader
        title={pageMeta.title}
        description="Dados essenciais para cadastro e participação nas campanhas."
        actions={
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <BadgeCheck className="h-4 w-4 text-primary" />
            <span>Validação automática</span>
          </div>
        }
      />

      <form onSubmit={handleSubmit(submitUser)} className="grid gap-6">
        <SectionCard>
          <SectionCardHeader icon={IdCard} title="Dados do usuário" />
          <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
            <Field className="min-w-0">
              <FieldLabel htmlFor="name">Nome completo</FieldLabel>
              <Input
                id="name"
                className="w-full min-w-0"
                autoComplete="name"
                {...register("name")}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field className="min-w-0">
              <FieldLabel htmlFor="dateOfBirth">Data de nascimento</FieldLabel>
              <Input
                id="dateOfBirth"
                type="date"
                className="w-full min-w-0"
                {...register("dateOfBirth")}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.dateOfBirth)}
              />
              {errors.dateOfBirth && (
                <FieldError>{errors.dateOfBirth.message}</FieldError>
              )}
            </Field>

            <Field className="min-w-0">
              <FieldLabel htmlFor="cpf">CPF</FieldLabel>
              <Input
                id="cpf"
                className="w-full min-w-0"
                inputMode="numeric"
                {...register("cpf")}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.cpf)}
              />
              {errors.cpf && <FieldError>{errors.cpf.message}</FieldError>}
            </Field>

            <Field className="min-w-0">
              <FieldLabel htmlFor="rg">RG</FieldLabel>
              <Input
                id="rg"
                className="w-full min-w-0"
                {...register("rg")}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.rg)}
              />
              {errors.rg && <FieldError>{errors.rg.message}</FieldError>}
            </Field>

            <Field className="min-w-0">
              <FieldLabel htmlFor="personalPhone">Telefone celular</FieldLabel>
              <Input
                id="personalPhone"
                className="w-full min-w-0"
                inputMode="tel"
                autoComplete="tel-national"
                {...register("personalPhone")}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.personalPhone)}
              />
              {errors.personalPhone && (
                <FieldError>{errors.personalPhone.message}</FieldError>
              )}
            </Field>

            <Field className="min-w-0">
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                id="email"
                type="email"
                className="w-full min-w-0"
                inputMode="email"
                autoComplete="email"
                {...register("email")}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionCardHeader icon={MapPin} title="Endereço" />
          <div className="grid gap-4 px-5 py-4 sm:grid-cols-3">
            <Field className="min-w-0">
              <FieldLabel htmlFor="address.cep">CEP</FieldLabel>
              <Input
                id="address.cep"
                className="w-full min-w-0"
                inputMode="numeric"
                {...register("address.cep")}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.address?.cep)}
              />
              {errors.address?.cep && (
                <FieldError>{errors.address.cep.message}</FieldError>
              )}
            </Field>

            <Field className="min-w-0">
              <FieldLabel htmlFor="address.estado">Estado</FieldLabel>
              <Input
                id="address.estado"
                className="w-full min-w-0"
                {...register("address.estado")}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.address?.estado)}
              />
              {errors.address?.estado && (
                <FieldError>{errors.address.estado.message}</FieldError>
              )}
            </Field>

            <Field className="min-w-0">
              <FieldLabel htmlFor="address.cidade">Cidade</FieldLabel>
              <Input
                id="address.cidade"
                className="w-full min-w-0"
                {...register("address.cidade")}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.address?.cidade)}
              />
              {errors.address?.cidade && (
                <FieldError>{errors.address.cidade.message}</FieldError>
              )}
            </Field>

            <Field className="min-w-0 sm:col-span-2">
              <FieldLabel htmlFor="address.rua">Rua</FieldLabel>
              <Input
                id="address.rua"
                className="w-full min-w-0"
                {...register("address.rua")}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.address?.rua)}
              />
              {errors.address?.rua && (
                <FieldError>{errors.address.rua.message}</FieldError>
              )}
            </Field>

            <Field className="min-w-0">
              <FieldLabel htmlFor="address.numero">Número</FieldLabel>
              <Input
                id="address.numero"
                className="w-full min-w-0"
                inputMode="numeric"
                {...register("address.numero")}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.address?.numero)}
              />
              {errors.address?.numero && (
                <FieldError>{errors.address.numero.message}</FieldError>
              )}
            </Field>

            <Field className="min-w-0">
              <FieldLabel htmlFor="address.bairro">Bairro</FieldLabel>
              <Input
                id="address.bairro"
                className="w-full min-w-0"
                {...register("address.bairro")}
                disabled={isViewMode}
                aria-invalid={Boolean(errors.address?.bairro)}
              />
              {errors.address?.bairro && (
                <FieldError>{errors.address.bairro.message}</FieldError>
              )}
            </Field>

            <Field className="min-w-0 sm:col-span-2">
              <FieldLabel htmlFor="address.complemento">Complemento</FieldLabel>
              <Input
                id="address.complemento"
                className="w-full min-w-0"
                {...register("address.complemento")}
                disabled={isViewMode}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionCardHeader icon={BadgeCheck} title="Resumo" />
          <div className="space-y-4 px-5 py-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">Contato</p>
                <p>E-mail e telefone para comunicação.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">Telefone</p>
                <p>Usado para suporte e confirmações.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">Dados pessoais</p>
                <p>Validação para evitar inconsistências.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              <p className="text-foreground">
                Preencha o CEP para autopreencher o endereço.
              </p>
            </div>
          </div>
        </SectionCard>

        {!isViewMode && (
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : ctaLabel}
            </Button>
          </div>
        )}
      </form>
    </PageShell>
  );
};
