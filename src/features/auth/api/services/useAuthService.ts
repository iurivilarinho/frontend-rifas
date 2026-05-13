import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/api/clients/apiClient";
import { resolveErrorMessage } from "@/api/utils/resolveErrorMessage";
import { resolveSuccessMessage } from "@/api/utils/resolveSuccessMessage";
import type { MutationOptions } from "@/api/types";
import type { AuthenticatedUser, LoginRequest } from "../dtos/auth";

const postLogin = async (payload: LoginRequest): Promise<AuthenticatedUser> => {
  const { data } = await apiClient.post<AuthenticatedUser>("/login", payload);
  return data;
};

export const useLogin = (
  options?: MutationOptions<AuthenticatedUser, LoginRequest>,
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
