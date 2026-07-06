import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/api/clients/apiClient";
import { resolveErrorMessage } from "@/api/utils/resolveErrorMessage";
import { resolveSuccessMessage } from "@/api/utils/resolveSuccessMessage";
import type { MutationOptions } from "@/api/types";
import type {
  CreateReservationRequest,
  MercadoPagoOrder,
} from "../dtos/reservation";

const postReservation = async (
  payload: CreateReservationRequest,
): Promise<MercadoPagoOrder> => {
  const { data } = await apiClient.post<MercadoPagoOrder>("/reservation", payload);
  return data;
};

export type PaymentStatus = "PENDING" | "PAID" | "EXPIRED" | "UNKNOWN";

export interface PaymentStatusResponse {
  status: PaymentStatus;
  paid: boolean;
}

export const getPaymentStatus = async (
  paymentId: number | string,
): Promise<PaymentStatusResponse> => {
  const { data } = await apiClient.get<PaymentStatusResponse>(
    `/reservation/payment-status/${paymentId}`,
  );
  return data;
};

export const useCreateReservation = (
  options?: MutationOptions<MercadoPagoOrder, CreateReservationRequest>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postReservation,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["raffles"] });
      if (options?.showToast !== false) {
        toast.success(
          resolveSuccessMessage({
            successMessage: options?.successMessage,
            data,
            variables,
            defaultMessage: "Reserva criada com sucesso",
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
            fallbackMessage: options?.errorMessage ?? "Erro ao criar reserva",
          }),
        );
      }
      options?.onError?.(error);
    },
  });
};
