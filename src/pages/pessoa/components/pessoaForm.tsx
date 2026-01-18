import { Button } from "@/components/button/button";
import { useCustomDialogContext } from "@/components/dialog/useCustomDialogContext";
import DragAndDrop from "@/components/dragAndDrop/dragAndDrop";
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

const enderecoSchema = z.object({
  rua: z.string().trim().min(1, "Rua é obrigatória"),
  numero: z.string().trim().min(1, "Número é obrigatório"),
  bairro: z.string().trim().min(1, "Bairro é obrigatório"),
  cidade: z.string().trim().min(1, "Cidade é obrigatória"),
  estado: z.string().trim().min(1, "Estado é obrigatório"),
  cep: z.string().trim().min(1, "CEP é obrigatório"),
  unidade: z.string().optional().default(""),
  bloco: z.string().optional().default(""),
  vagaEstacionamento: z.string().optional().default(""),
  complemento: z.string().optional().default(""),
});

const informacaoSegurancaSchema = z.object({
  codigoAcesso: z.string().trim().min(1, "Código de acesso é obrigatório"),
  tipoPessoa: z.enum(["FUNCIONARIO", "VISITANTE"]).default("FUNCIONARIO"),
  dataEntrada: z.string().trim().min(1, "Data de entrada é obrigatória"),
  dataSaida: z.string().optional().default(""),
  placaVeiculo: z.string().optional().default(""),
  autorizacaoEntradaVisitantes: z.boolean().default(false),
  nomeContatoEmergencia: z
    .string()
    .trim()
    .min(1, "Nome do contato de emergência é obrigatório"),
  relacaoContatoEmergencia: z
    .string()
    .trim()
    .min(1, "Relação com o contato de emergência é obrigatória"),
  telefoneContatoEmergencia: z
    .string()
    .trim()
    .min(1, "Telefone do contato de emergência é obrigatório"),
});

const pessoaSchema = z.object({
  foto: z
    .union([z.instanceof(File), z.array(z.instanceof(File)), z.null()])
    .optional()
    .default(null),

  nomeCompleto: z.string().trim().min(1, "Nome completo é obrigatório"),
  dataNascimento: z.string().trim().min(1, "Data de nascimento é obrigatória"),
  cpf: z.string().trim().min(1, "CPF é obrigatório"),
  rg: z.string().trim().min(1, "RG é obrigatório"),
  genero: z.string().trim().min(1, "Gênero é obrigatório"),
  estadoCivil: z.string().trim().min(1, "Estado civil é obrigatório"),
  telefoneCelular: z.string().trim().min(1, "Telefone celular é obrigatório"),
  telefoneResidencial: z
    .string()
    .trim()
    .min(1, "Telefone residencial é obrigatório"),
  email: z
    .string()
    .trim()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),

  endereco: enderecoSchema,
  informacaoSeguranca: informacaoSegurancaSchema,
});

type PessoaFormValues = z.infer<typeof pessoaSchema>;

const defaultValues: PessoaFormValues = {
  foto: null,
  nomeCompleto: "",
  dataNascimento: "",
  cpf: "",
  rg: "",
  genero: "",
  estadoCivil: "",
  telefoneCelular: "",
  telefoneResidencial: "",
  email: "",
  endereco: {
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    unidade: "",
    bloco: "",
    vagaEstacionamento: "",
    complemento: "",
  },
  informacaoSeguranca: {
    codigoAcesso: "",
    tipoPessoa: "FUNCIONARIO",
    dataEntrada: "",
    dataSaida: "",
    placaVeiculo: "",
    autorizacaoEntradaVisitantes: false,
    nomeContatoEmergencia: "",
    relacaoContatoEmergencia: "",
    telefoneContatoEmergencia: "",
  },
};

function buildPessoaFormData(values: PessoaFormValues) {
  const formData = new FormData();

  const { foto, ...props } = values;

  if (foto) {
    if (Array.isArray(foto))
      foto.forEach((file) => formData.append("file", file));
    else formData.append("file", foto);
  }

  formData.append(
    "form",
    new Blob([JSON.stringify(props)], { type: "application/json" })
  );

  return formData;
}

const PessoaForm = () => {
  const navigate = useNavigate();
  const { formType, userId } = useParams();
  const visualizacao = formType === "visualizar";

  const { setCustomDialog } = useCustomDialogContext();

  const [cep, setCep] = useState("");
  const { data: dataCep } = useGetCEP(cep);

  const { data: dataPessoa } = useGetPessoaById(userId ?? "");

  const {
    setValue,
    reset,
    watch,
    trigger,
    formState: { errors },
  } = useForm<PessoaFormValues>({
    resolver: zodResolver(pessoaSchema),
    mode: "onBlur",
    defaultValues,
    shouldUnregister: false,
  });

  const formValues = watch();

  const handleChange = <TPath extends Path<PessoaFormValues>>(
    path: TPath,
    value: any
  ) => {
    setValue(path, value, { shouldDirty: true });
  };

  const validateField = async <TPath extends Path<PessoaFormValues>>(
    path: TPath
  ) => {
    await trigger(path);
  };

  const validateForm = async () => {
    return await trigger();
  };

  // Popular form ao carregar pessoa (sem mudar o “jeito” do JSX)
  useEffect(() => {
    if (!dataPessoa) return;

    const merged: PessoaFormValues = {
      ...defaultValues,
      ...dataPessoa,
      endereco: { ...defaultValues.endereco, ...(dataPessoa as any).endereco },
      informacaoSeguranca: {
        ...defaultValues.informacaoSeguranca,
        ...(dataPessoa as any).informacaoSeguranca,
      },
      foto: null,
    };

    reset(merged, { keepDirty: false, keepTouched: false });
  }, [dataPessoa, reset]);

  // Autopreencher endereço pelo CEP
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
  }, [dataCep]);

  const {
    mutate: postPessoa,
    isPending: isPendingPost,
    isSuccess: isSuccessPost,
    error: errorPost,
  } = usePostPessoa();

  const {
    mutate: putPessoa,
    isPending: isPendingPut,
    isSuccess: isSuccessPut,
    error: errorPut,
  } = usePutPessoa();

  const isLoading = useMemo(
    () => isPendingPost || isPendingPut,
    [isPendingPost, isPendingPut]
  );

  const submitForm = async () => {
    const ok = await validateForm();
    if (!ok) return;

    const formData = buildPessoaFormData(formValues);
    postPessoa(formData);
  };

  const updateForm = async () => {
    const ok = await validateForm();
    if (!ok) return;

    const formData = buildPessoaFormData(formValues);
    putPessoa({ pessoa: formData, id: userId ?? "" });
  };

  useEffect(() => {
    if (isSuccessPut || isSuccessPost) navigate("/");
  }, [isSuccessPut, isSuccessPost, navigate]);

  useEffect(() => {
    if (!errorPost && !errorPut) return;

    const errorMessage =
      (errorPost as any)?.response?.data?.message ||
      (errorPut as any)?.response?.data?.message ||
      "Ocorreu algum erro!";

    setCustomDialog({
      message: errorMessage,
      title: "Erro",
      type: "error",
      closeHandler: () => setCustomDialog({}),
    });
  }, [errorPost, errorPut, setCustomDialog]);

  return (
    <div className="flex w-full h-full max-w-5xl flex-col gap-6 p-6">
      {/* Dados Pessoais */}
      <div className="flex flex-col gap-3 border border-gray-500/40 rounded-lg p-6 bg-white">
        <h1 className="text-2xl font-semibold pb-4 border-b-2">
          Detalhes Pessoais
        </h1>

        <div className="flex gap-8">
          <Input
            label="Nome Completo"
            className="w-lvw"
            value={formValues.nomeCompleto}
            onChange={(e) => handleChange("nomeCompleto", e.target.value)}
            onBlur={() => validateField("nomeCompleto")}
            disabled={visualizacao}
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
            disabled={visualizacao}
            notification={{
              isError: Boolean(errors.dataNascimento?.message),
              notification: errors.dataNascimento?.message ?? "",
            }}
          />
        </div>

        <div className="flex gap-8">
          <Input
            className="w-full"
            label="CPF"
            value={formValues.cpf}
            onChange={(e) => handleChange("cpf", e.target.value)}
            onBlur={() => validateField("cpf")}
            disabled={visualizacao}
            notification={{
              isError: Boolean(errors.cpf?.message),
              notification: errors.cpf?.message ?? "",
            }}
          />

          <Input
            label="RG"
            className="w-full"
            value={formValues.rg}
            onChange={(e) => handleChange("rg", e.target.value)}
            onBlur={() => validateField("rg")}
            disabled={visualizacao}
            notification={{
              isError: Boolean(errors.rg?.message),
              notification: errors.rg?.message ?? "",
            }}
          />
        </div>

        <div className="flex gap-8">
          <Input
            className="w-full"
            label="Gênero"
            value={formValues.genero}
            onChange={(e) => handleChange("genero", e.target.value)}
            onBlur={() => validateField("genero")}
            disabled={visualizacao}
            notification={{
              isError: Boolean(errors.genero?.message),
              notification: errors.genero?.message ?? "",
            }}
          />

          <Input
            className="w-full"
            label="Estado Civil"
            value={formValues.estadoCivil}
            onChange={(e) => handleChange("estadoCivil", e.target.value)}
            onBlur={() => validateField("estadoCivil")}
            disabled={visualizacao}
            notification={{
              isError: Boolean(errors.estadoCivil?.message),
              notification: errors.estadoCivil?.message ?? "",
            }}
          />
        </div>

        <div className="flex gap-8">
          <Input
            label="Telefone Celular"
            className="w-full"
            value={formValues.telefoneCelular}
            onChange={(e) => handleChange("telefoneCelular", e.target.value)}
            disabled={visualizacao}
            onBlur={() => validateField("telefoneCelular")}
            notification={{
              isError: Boolean(errors.telefoneCelular?.message),
              notification: errors.telefoneCelular?.message ?? "",
            }}
          />

          <Input
            label="Telefone Residencial"
            className="w-full"
            value={formValues.telefoneResidencial}
            disabled={visualizacao}
            onChange={(e) =>
              handleChange("telefoneResidencial", e.target.value)
            }
            onBlur={() => validateField("telefoneResidencial")}
            notification={{
              isError: Boolean(errors.telefoneResidencial?.message),
              notification: errors.telefoneResidencial?.message ?? "",
            }}
          />
        </div>

        <Input
          label="Email"
          type="email"
          value={formValues.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => validateField("email")}
          disabled={visualizacao}
          notification={{
            isError: Boolean(errors.email?.message),
            notification: errors.email?.message ?? "",
          }}
        />

        <DragAndDrop
          onAddFile={(files) => {
            handleChange("foto", files);
          }}
          label="Foto da Pessoa"
          acceptedFileTypes={{
            ".jpg": ["image/jpeg"],
            ".jpeg": ["image/jpeg"],
            ".png": ["image/png"],
          }}
        />
      </div>

      {/* Endereço */}
      <div className="flex flex-col gap-3 border border-gray-500/40 rounded-lg p-6 bg-white">
        <h1 className="text-2xl font-semibold pb-4 border-b-2">Endereço</h1>

        <div className="flex gap-32">
          <div className="flex gap-8">
            <Input
              disabled={visualizacao}
              label="CEP"
              value={formValues.endereco.cep}
              className="w-32"
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
              disabled={visualizacao}
              label="Estado"
              className="w-16"
              value={formValues.endereco.estado}
              onChange={(e) => handleChange("endereco.estado", e.target.value)}
              onBlur={() => validateField("endereco.estado")}
              notification={{
                isError: Boolean(errors.endereco?.estado?.message),
                notification: errors.endereco?.estado?.message ?? "",
              }}
            />
          </div>

          <Input
            label="Cidade"
            className="w-full"
            value={formValues.endereco.cidade}
            onChange={(e) => handleChange("endereco.cidade", e.target.value)}
            onBlur={() => validateField("endereco.cidade")}
            disabled={visualizacao}
            notification={{
              isError: Boolean(errors.endereco?.cidade?.message),
              notification: errors.endereco?.cidade?.message ?? "",
            }}
          />

          <Input
            label="Rua"
            className="w-full"
            value={formValues.endereco.rua}
            onChange={(e) => handleChange("endereco.rua", e.target.value)}
            onBlur={() => validateField("endereco.rua")}
            disabled={visualizacao}
            notification={{
              isError: Boolean(errors.endereco?.rua?.message),
              notification: errors.endereco?.rua?.message ?? "",
            }}
          />
        </div>

        <div className="flex gap-32">
          <Input
            label="Número"
            className="w-full"
            value={formValues.endereco.numero}
            onChange={(e) => handleChange("endereco.numero", e.target.value)}
            onBlur={() => validateField("endereco.numero")}
            disabled={visualizacao}
            notification={{
              isError: Boolean(errors.endereco?.numero?.message),
              notification: errors.endereco?.numero?.message ?? "",
            }}
          />

          <Input
            label="Bairro"
            value={formValues.endereco.bairro}
            className="w-full"
            onChange={(e) => handleChange("endereco.bairro", e.target.value)}
            onBlur={() => validateField("endereco.bairro")}
            disabled={visualizacao}
            notification={{
              isError: Boolean(errors.endereco?.bairro?.message),
              notification: errors.endereco?.bairro?.message ?? "",
            }}
          />

          <Input
            label="Bloco"
            className="w-full"
            value={formValues.endereco.bloco}
            onChange={(e) => handleChange("endereco.bloco", e.target.value)}
            onBlur={() => validateField("endereco.bloco")}
            disabled={visualizacao}
            notification={{
              isError: Boolean(errors.endereco?.bloco?.message),
              notification: errors.endereco?.bloco?.message ?? "",
            }}
          />
        </div>

        <div className="flex gap-32">
          <Input
            label="Unidade"
            value={formValues.endereco.unidade}
            className="w-full"
            onChange={(e) => handleChange("endereco.unidade", e.target.value)}
            onBlur={() => validateField("endereco.unidade")}
            disabled={visualizacao}
            notification={{
              isError: Boolean(errors.endereco?.unidade?.message),
              notification: errors.endereco?.unidade?.message ?? "",
            }}
          />

          <Input
            label="Complemento"
            className="w-full"
            value={formValues.endereco.complemento}
            onChange={(e) =>
              handleChange("endereco.complemento", e.target.value)
            }
            onBlur={() => validateField("endereco.complemento")}
            disabled={visualizacao}
            notification={{
              isError: Boolean(errors.endereco?.complemento?.message),
              notification: errors.endereco?.complemento?.message ?? "",
            }}
          />

          <Input
            label="Vaga de Estacionamento"
            className="w-full"
            value={formValues.endereco.vagaEstacionamento}
            onChange={(e) =>
              handleChange("endereco.vagaEstacionamento", e.target.value)
            }
            onBlur={() => validateField("endereco.vagaEstacionamento")}
            disabled={visualizacao}
            notification={{
              isError: Boolean(errors.endereco?.vagaEstacionamento?.message),
              notification: errors.endereco?.vagaEstacionamento?.message ?? "",
            }}
          />
        </div>
      </div>

      {/* Informação de Segurança */}
      <div className="flex flex-col gap-3 border border-gray-500/40 rounded-lg p-6 bg-white">
        <h1 className="text-2xl font-semibold pb-4 border-b-2">
          Informações Complementares
        </h1>

        <div className="flex gap-28">
          <Input
            label="Código de Acesso"
            className="w-full"
            value={formValues.informacaoSeguranca.codigoAcesso}
            onChange={(e) =>
              handleChange("informacaoSeguranca.codigoAcesso", e.target.value)
            }
            onBlur={() => validateField("informacaoSeguranca.codigoAcesso")}
            disabled={visualizacao}
            notification={{
              isError: Boolean(
                errors.informacaoSeguranca?.codigoAcesso?.message
              ),
              notification:
                errors.informacaoSeguranca?.codigoAcesso?.message ?? "",
            }}
          />

          <Input
            label="Placa do Veículo"
            className="w-full"
            value={formValues.informacaoSeguranca.placaVeiculo}
            onChange={(e) =>
              handleChange("informacaoSeguranca.placaVeiculo", e.target.value)
            }
            onBlur={() => validateField("informacaoSeguranca.placaVeiculo")}
            disabled={visualizacao}
            notification={{
              isError: Boolean(
                errors.informacaoSeguranca?.placaVeiculo?.message
              ),
              notification:
                errors.informacaoSeguranca?.placaVeiculo?.message ?? "",
            }}
          />
        </div>

        <div className="flex gap-28">
          <Input
            label="Data de Entrada"
            className="w-full"
            type="date"
            value={formValues.informacaoSeguranca.dataEntrada}
            onChange={(e) =>
              handleChange("informacaoSeguranca.dataEntrada", e.target.value)
            }
            onBlur={() => validateField("informacaoSeguranca.dataEntrada")}
            disabled={visualizacao}
            notification={{
              isError: Boolean(
                errors.informacaoSeguranca?.dataEntrada?.message
              ),
              notification:
                errors.informacaoSeguranca?.dataEntrada?.message ?? "",
            }}
          />

          <Input
            label="Data de Saída"
            className="w-full"
            type="date"
            value={formValues.informacaoSeguranca.dataSaida}
            onChange={(e) =>
              handleChange("informacaoSeguranca.dataSaida", e.target.value)
            }
            onBlur={() => validateField("informacaoSeguranca.dataSaida")}
            disabled={visualizacao}
            notification={{
              isError: Boolean(errors.informacaoSeguranca?.dataSaida?.message),
              notification:
                errors.informacaoSeguranca?.dataSaida?.message ?? "",
            }}
          />
        </div>

        <div className="flex gap-8">
          <Input
            label="Nome do Contato de Emergência"
            className="w-full"
            value={formValues.informacaoSeguranca.nomeContatoEmergencia}
            onChange={(e) =>
              handleChange(
                "informacaoSeguranca.nomeContatoEmergencia",
                e.target.value
              )
            }
            onBlur={() =>
              validateField("informacaoSeguranca.nomeContatoEmergencia")
            }
            disabled={visualizacao}
            notification={{
              isError: Boolean(
                errors.informacaoSeguranca?.nomeContatoEmergencia?.message
              ),
              notification:
                errors.informacaoSeguranca?.nomeContatoEmergencia?.message ??
                "",
            }}
          />

          <Input
            label="Relação com o Contato de Emergência"
            className="w-full"
            value={formValues.informacaoSeguranca.relacaoContatoEmergencia}
            onChange={(e) =>
              handleChange(
                "informacaoSeguranca.relacaoContatoEmergencia",
                e.target.value
              )
            }
            onBlur={() =>
              validateField("informacaoSeguranca.relacaoContatoEmergencia")
            }
            disabled={visualizacao}
            notification={{
              isError: Boolean(
                errors.informacaoSeguranca?.relacaoContatoEmergencia?.message
              ),
              notification:
                errors.informacaoSeguranca?.relacaoContatoEmergencia?.message ??
                "",
            }}
          />

          <Input
            label="Telefone do Contato de Emergência"
            className="w-full"
            value={formValues.informacaoSeguranca.telefoneContatoEmergencia}
            onChange={(e) =>
              handleChange(
                "informacaoSeguranca.telefoneContatoEmergencia",
                e.target.value
              )
            }
            onBlur={() =>
              validateField("informacaoSeguranca.telefoneContatoEmergencia")
            }
            disabled={visualizacao}
            notification={{
              isError: Boolean(
                errors.informacaoSeguranca?.telefoneContatoEmergencia?.message
              ),
              notification:
                errors.informacaoSeguranca?.telefoneContatoEmergencia
                  ?.message ?? "",
            }}
          />
        </div>
      </div>

      {!visualizacao && (
        <div className="flex justify-end">
          <Button
            onClick={formType === "editar" ? updateForm : submitForm}
            disabled={isLoading}
          >
            {isLoading
              ? "Enviando..."
              : formType === "editar"
                ? "Editar"
                : "Cadastrar"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PessoaForm;
