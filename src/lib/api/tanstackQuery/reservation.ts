import { MercadoPagoOrder } from "@/types/MercadoPagoOrder";
import { Reservation } from "@/types/reserva";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import httpRequest from "../axios/httpRequests";

const postReservation = async (reservation: Reservation) => {
  const { data } = await httpRequest.post("/reservation", reservation);
  return data;
};

interface PutReservationParams {
  Reservation: FormData;
  id: number | string;
}

const putReservation = async ({ id, Reservation }: PutReservationParams) => {
  const { data } = await httpRequest.put(`/reservation/${id}`, Reservation);
  return data;
};

const getReservation = async (filter?: string) => {
  const { data } = await httpRequest.get(`/reservation?${filter ?? ""}`);
  return data;
};

const getReservationById = async (id: number | string) => {
  const { data } = await httpRequest.get(`/reservation/${id}`);
  return data;
};

export const useGetReservation = (filter?: string) => {
  return useQuery({
    queryKey: ["Reservations", filter],
    queryFn: () => getReservation(filter),
  });
};

export const useGetReservationById = (id: number | string) => {
  return useQuery({
    queryKey: ["Reservations", id],
    queryFn: () => getReservationById(id),
  });
};

export const usePostReservation = () => {
  const queryClient = useQueryClient();

  return useMutation<MercadoPagoOrder, unknown, Reservation>({
    mutationFn: postReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rifas"] });
    },
  });
};

export const usePutReservation = () => {
  return useMutation({ mutationFn: putReservation });
};
