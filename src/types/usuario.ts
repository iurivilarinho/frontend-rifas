import { z } from "zod";

// Função para validar o CPF
const isValidCPF = (cpf: string) => {
  cpf = cpf.replace(/[^\d]+/g, ""); // Remove caracteres não numéricos

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  let soma;
  let resto;

  // Validação do primeiro dígito verificador
  soma = 0;
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

// Schema de validação usando Zod
export const userFormSchema = z.object({
  fullName: z.string().min(1, "O nome completo é obrigatório!"),
  email: z.string().email("Formato de email inválido!"),
  cpf: z.string().refine(isValidCPF, {
    message: "CPF inválido!",
  }),
  numberPhone: z.string().min(1, "O número de celular é obrigatório!"),
});

// Tipo inferido do schema de validação
export type UserFormType = z.infer<typeof userFormSchema>;
