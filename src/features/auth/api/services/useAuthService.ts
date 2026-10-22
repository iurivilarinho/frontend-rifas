import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/api/clients/apiClient";
import { resolveErrorMessage } from "@/api/utils/resolveErrorMessage";
import { resolveSuccessMessage } from "@/api/utils/resolveSuccessMessage";
import type { MutationOptions } from "@/api/types";
import { turnstileHeaders } from "@/components/turnstile";
import type {
  AuthenticatedUser,
  ClientRegistrationRequest,
  LoginRequest,
} from "../dtos/auth";

export type LoginVariables = LoginRequest & { turnstileToken?: string | null };
export type RegisterVariables = ClientRegistrationRequest & {
  turnstileToken?: string | null;
};

const postLogin = async ({
  turnstileToken,
  ...payload
}: LoginVariables): Promise<AuthenticatedUser> => {
  const { data } = await apiClient.post<AuthenticatedUser>("/login", payload, {
    headers: turnstileHeaders(turnstileToken),
  });
  return data;
};

const postRegister = async ({
  turnstileToken,
  ...payload
}: RegisterVariables): Promise<void> => {
  await apiClient.post("/auth/register", payload, {
    headers: turnstileHeaders(turnstileToken),
  });
};

export const useLogin = (
  options?: MutationOptions<AuthenticatedUser, LoginVariables>,
) => {
  return useMutation({
    mutationFn: postLogin,
    onSuccess: (data, variables) => {
      if (options?.showToast !== false) {
        toast.success(
          resolveSuccessMessage({
            successMessage: options?.successMessage,
            data,
            variables,
            defaultMessage: "Login realizado com sucesso",
          }),
        );
      }
      options?.onSuccess?.(data, variables);
    },
    onError: (error: Error) => {
      if (options?.showToast !== false) {
        toast.error(
          resolveErrorMessage({
            error,
            fallbackMessage: options?.errorMessage ?? "Erro ao realizar login",
          }),
        );
      }
      options?.onError?.(error);
    },
  });
};

export const useRegisterClient = (
  options?: MutationOptions<void, RegisterVariables>,
) => {
  return useMutation({
    mutationFn: postRegister,
    onSuccess: (data, variables) => {
      if (options?.showToast !== false) {
        toast.success(
          resolveSuccessMessage({
            successMessage: options?.successMessage,
            data,
            variables,
            defaultMessage: "Cadastro realizado com sucesso",
          }),
        );
      }
      options?.onSuccess?.(data, variables);
    },
    onError: (error: Error) => {
      if (options?.showToast !== false) {
        toast.error(
          resolveErrorMessage({
            error,
            fallbackMessage: options?.errorMessage ?? "Erro ao criar conta",
          }),
        );
      }
      options?.onError?.(error);
    },
  });
};
