import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/api/clients/apiClient";
import { resolveErrorMessage } from "@/api/utils/resolveErrorMessage";
import { resolveSuccessMessage } from "@/api/utils/resolveSuccessMessage";
import type { MutationOptions, QueryOptions } from "@/api/types";
import type { RaffleApiDto } from "../dtos/raffle";

const getRaffles = async (): Promise<RaffleApiDto[]> => {
  const { data } = await apiClient.get<RaffleApiDto[]>("/rifas");
  return data;
};

export const useGetRaffles = (options?: QueryOptions<RaffleApiDto[]>) => {
  return useQuery({
    queryKey: ["raffles"],
    queryFn: getRaffles,
    ...options,
  });
};

const getMyRaffles = async (): Promise<RaffleApiDto[]> => {
  const { data } = await apiClient.get<RaffleApiDto[]>("/rifas/mine");
  return data;
};

export const useGetMyRaffles = (options?: QueryOptions<RaffleApiDto[]>) => {
  return useQuery({
    queryKey: ["raffles", "mine"],
    queryFn: getMyRaffles,
    ...options,
  });
};

const getRaffleById = async (id: number | string): Promise<RaffleApiDto> => {
  const { data } = await apiClient.get<RaffleApiDto>(`/rifas/${id}`);
  return data;
};

export const useGetRaffleById = (
  id?: number | string,
  options?: QueryOptions<RaffleApiDto>,
) => {
  const enabled = Boolean(id) && (options?.enabled ?? true);

  return useQuery({
    queryKey: ["raffle", id],
    queryFn: () => getRaffleById(id!),
    enabled,
    ...options,
  });
};

const getRaffleByIdAndBuyer = async (
  id: number | string,
  identifier: string,
): Promise<RaffleApiDto> => {
  const { data } = await apiClient.get<RaffleApiDto>(`/rifas/${id}/${identifier}`);
  return data;
};

export const useGetRaffleByIdAndBuyer = (
  id?: number | string,
  identifier?: string,
  options?: QueryOptions<RaffleApiDto>,
) => {
  const enabled = Boolean(id) && Boolean(identifier) && (options?.enabled ?? true);

  return useQuery({
    queryKey: ["raffle", id, identifier],
    queryFn: () => getRaffleByIdAndBuyer(id!, identifier!),
    enabled,
    ...options,
  });
};

const getRafflesByCpf = async (cpf: number | string): Promise<RaffleApiDto[]> => {
  const { data } = await apiClient.get<RaffleApiDto[]>(`/rifas/cpf/${cpf}`);
  return data;
};

export const useGetRafflesByCpf = (
  cpf?: number | string,
  options?: QueryOptions<RaffleApiDto[]>,
) => {
  const enabled = Boolean(cpf) && (options?.enabled ?? true);

  return useQuery({
    queryKey: ["raffles", "byCpf", cpf],
    queryFn: () => getRafflesByCpf(cpf!),
    enabled,
    ...options,
  });
};

interface CreateRaffleVariables {
  payload: FormData;
}

const postRaffle = async ({
  payload,
}: CreateRaffleVariables): Promise<RaffleApiDto> => {
  const { data } = await apiClient.post<RaffleApiDto>("/rifas", payload);
  return data;
};

export const useCreateRaffle = (
  options?: MutationOptions<RaffleApiDto, CreateRaffleVariables>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postRaffle,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["raffles"] });
      if (options?.showToast !== false) {
        toast.success(
          resolveSuccessMessage({
            successMessage: options?.successMessage,
            data,
            variables,
            defaultMessage: "Ação criada com sucesso",
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
            fallbackMessage: options?.errorMessage ?? "Erro ao criar ação",
          }),
        );
      }
      options?.onError?.(error);
    },
  });
};

interface UpdateRaffleVariables {
  id: number | string;
  payload: FormData;
}

const putRaffle = async ({
  id,
  payload,
}: UpdateRaffleVariables): Promise<RaffleApiDto> => {
  const { data } = await apiClient.put<RaffleApiDto>(`/rifas/${id}`, payload);
  return data;
};

export const useUpdateRaffle = (
  options?: MutationOptions<RaffleApiDto, UpdateRaffleVariables>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: putRaffle,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["raffles"] });
      queryClient.invalidateQueries({ queryKey: ["raffle", variables.id] });
      if (options?.showToast !== false) {
        toast.success(
          resolveSuccessMessage({
            successMessage: options?.successMessage,
            data,
            variables,
            defaultMessage: "Ação atualizada com sucesso",
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
            fallbackMessage: options?.errorMessage ?? "Erro ao atualizar ação",
          }),
        );
      }
      options?.onError?.(error);
    },
  });
};

export type RaffleStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "OPEN"
  | "PAUSED"
  | "SOLD_OUT"
  | "CLOSED"
  | "DRAWN"
  | "CANCELLED";

interface UpdateRaffleStatusVariables {
  id: number | string;
  target: RaffleStatus;
}

const putRaffleStatus = async ({
  id,
  target,
}: UpdateRaffleStatusVariables): Promise<RaffleApiDto> => {
  const { data } = await apiClient.put<RaffleApiDto>(`/rifas/${id}/status`, { target });
  return data;
};

export const useUpdateRaffleStatus = (
  options?: MutationOptions<RaffleApiDto, UpdateRaffleStatusVariables>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: putRaffleStatus,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["raffles"] });
      queryClient.invalidateQueries({ queryKey: ["raffle", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      if (options?.showToast !== false) {
        toast.success(
          resolveSuccessMessage({
            successMessage: options?.successMessage,
            data,
            variables,
            defaultMessage: "Status atualizado",
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
            fallbackMessage: options?.errorMessage ?? "Erro ao atualizar status",
          }),
        );
      }
      options?.onError?.(error);
    },
  });
};

export interface RaffleDrawWinner {
  quotaId: number;
  quotaNumber: number;
  buyerName: string | null;
  buyerCpf: string | null;
  buyerEmail: string | null;
}

export interface RaffleDrawApiDto {
  id: number;
  raffleId: number;
  winnersCount: number;
  method: string;
  seed: string;
  notes: string | null;
  createdAt: string;
  winners: RaffleDrawWinner[];
}

interface PerformDrawVariables {
  raffleId: number | string;
  winnersCount: number;
  notes?: string;
}

const postDraw = async ({
  raffleId,
  winnersCount,
  notes,
}: PerformDrawVariables): Promise<RaffleDrawApiDto> => {
  const { data } = await apiClient.post<RaffleDrawApiDto>(`/rifas/${raffleId}/draws`, {
    winnersCount,
    notes,
  });
  return data;
};

export const usePerformDraw = (
  options?: MutationOptions<RaffleDrawApiDto, PerformDrawVariables>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postDraw,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["raffles"] });
      queryClient.invalidateQueries({ queryKey: ["raffle", variables.raffleId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["raffle-draws", variables.raffleId] });
      if (options?.showToast !== false) {
        toast.success(
          resolveSuccessMessage({
            successMessage: options?.successMessage,
            data,
            variables,
            defaultMessage: "Sorteio realizado",
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
            fallbackMessage: options?.errorMessage ?? "Erro ao realizar sorteio",
          }),
        );
      }
      options?.onError?.(error);
    },
  });
};

const getDraws = async (raffleId: number | string): Promise<RaffleDrawApiDto[]> => {
  const { data } = await apiClient.get<RaffleDrawApiDto[]>(`/rifas/${raffleId}/draws`);
  return data;
};

export const useGetRaffleDraws = (
  raffleId?: number | string,
  options?: QueryOptions<RaffleDrawApiDto[]>,
) => {
  return useQuery({
    queryKey: ["raffle-draws", raffleId],
    queryFn: () => getDraws(raffleId!),
    enabled: Boolean(raffleId) && (options?.enabled ?? true),
    ...options,
  });
};

interface RefundReservationVariables {
  reservationId: number;
  notes?: string;
}

interface RefundResult {
  automatic: boolean;
  detail: string;
}

const postRefund = async ({
  reservationId,
  notes,
}: RefundReservationVariables): Promise<RefundResult> => {
  const { data } = await apiClient.post<RefundResult>(
    `/reservation/${reservationId}/refund`,
    { notes },
  );
  return data;
};

export const useRefundReservation = (
  options?: MutationOptions<RefundResult, RefundReservationVariables>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postRefund,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["raffle-buyers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      if (options?.showToast !== false) {
        // Mostra a mensagem do backend (automático via MP vs. marcado p/ PIX manual).
        toast.success(
          resolveSuccessMessage({
            successMessage: options?.successMessage,
            data,
            variables,
            defaultMessage: data?.detail ?? "Reserva estornada",
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
            fallbackMessage: options?.errorMessage ?? "Erro ao estornar reserva",
          }),
        );
      }
      options?.onError?.(error);
    },
  });
};
