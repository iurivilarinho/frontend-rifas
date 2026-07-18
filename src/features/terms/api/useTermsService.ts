import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "@/api/clients/apiClient";
import { resolveErrorMessage } from "@/api/utils/resolveErrorMessage";
import type { MutationOptions } from "@/api/types";

import type { PublishTermsPayload, TermsStatus, TermsVersion } from "./terms";

const hasLocalSession = () => {
  try {
    return Boolean(localStorage.getItem("user"));
  } catch {
    return false;
  }
};

/** Versão vigente (pública). Usada na página pública e no gate. */
export const useCurrentTerms = () =>
  useQuery({
    queryKey: ["terms", "current"],
    queryFn: async () => (await apiClient.get<TermsVersion>("/terms/current")).data,
  });

/** Situação do usuário logado. Só busca com sessão local. */
export const useTermsStatus = () =>
  useQuery({
    queryKey: ["terms", "status"],
    queryFn: async () => (await apiClient.get<TermsStatus>("/terms/me")).data,
    enabled: hasLocalSession(),
    staleTime: 0,
    retry: false,
  });

export const useAcceptTerms = (options?: MutationOptions<TermsStatus, { termsVersionId: number }>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { termsVersionId: number }) =>
      (await apiClient.post<TermsStatus>("/terms/accept", payload)).data,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["terms", "status"], data);
      queryClient.invalidateQueries({ queryKey: ["terms", "status"] });
      options?.onSuccess?.(data, variables);
    },
    onError: (error: Error) => {
      if (options?.showToast !== false) {
        toast.error(resolveErrorMessage({ error, fallbackMessage: "Não foi possível registrar o aceite." }));
      }
      options?.onError?.(error);
    },
  });
};

/** Histórico de versões (admin). */
export const useTermsHistory = (enabled: boolean) =>
  useQuery({
    queryKey: ["terms", "history"],
    queryFn: async () => (await apiClient.get<TermsVersion[]>("/terms")).data,
    enabled,
  });

export const usePublishTerms = (options?: MutationOptions<TermsVersion, PublishTermsPayload>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PublishTermsPayload) =>
      (await apiClient.post<TermsVersion>("/terms", payload)).data,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["terms"] });
      if (options?.showToast !== false) {
        toast.success(`Versão ${data.version} publicada! Passa a valer para os próximos aceites.`);
      }
      options?.onSuccess?.(data, variables);
    },
    onError: (error: Error) => {
      if (options?.showToast !== false) {
        toast.error(resolveErrorMessage({ error, fallbackMessage: "Não foi possível publicar a nova versão." }));
      }
      options?.onError?.(error);
    },
  });
};
