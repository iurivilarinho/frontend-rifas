import { AxiosError } from "axios";

interface ResolveErrorMessageParams {
  error: unknown;
  fallbackMessage?: string;
}

export const resolveErrorMessage = ({
  error,
  fallbackMessage,
}: ResolveErrorMessageParams): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (error.message) return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage ?? "Ocorreu um erro inesperado";
};
