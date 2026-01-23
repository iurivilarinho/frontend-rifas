import { useMutation, useQuery } from "@tanstack/react-query";
import httpRequest from "../axios/httpRequests";

const postRifa = async (Rifa: FormData) => {
  const { data } = await httpRequest.post("/rifas", Rifa);
  return data;
};

interface PutRifaParams {
  rifa: FormData;
  id: number | string;
}

const putRifa = async ({ id, rifa }: PutRifaParams) => {
  const { data } = await httpRequest.put(`/rifas/${id}`, rifa);
  return data;
};

const getRifa = async (filter?: string) => {
  const { data } = await httpRequest.get(`/rifas?${filter ?? ""}`);
  return data;
};

const getRifaById = async (id: number | string) => {
  const { data } = await httpRequest.get(`/rifas/${id}`);
  return data;
};

const getRifaByIdAndBuyerIdentifier = async (
  id: number | string,
  identifier: string,
) => {
  const { data } = await httpRequest.get(`/rifas/${id}/${identifier}`);
  return data;
};
const getRifaByCpf = async (cpf: number | string) => {
  const { data } = await httpRequest.get(`/rifas/cpf/${cpf}`);
  return data;
};

export const useGetRifa = (filter?: string) => {
  return useQuery({
    queryKey: ["rifas", filter],
    queryFn: () => getRifa(filter),
  });
};

export const useGetRifaById = (id: number | string) => {
  return useQuery({
    queryKey: ["rifas", id],
    queryFn: () => getRifaById(id),
    enabled: !!id,
  });
};

export const useGetRifaByIdAndBuyerIdentifier = (
  id: number | string,
  identifier: string,
) => {
  return useQuery({
    queryKey: ["rifas", id],
    queryFn: () => getRifaByIdAndBuyerIdentifier(id, identifier),
    enabled: !!id,
  });
};

export const useGetRifaByCpf = (cpf: number | string, options = {}) => {
  return useQuery({
    queryKey: ["rifas", cpf],
    queryFn: () => getRifaByCpf(cpf),
    enabled: Boolean(cpf), // Executa apenas quando o CPF está disponível
    ...options, // Caso você queira passar outras opções no futuro
  });
};

export const usePostRifa = () => {
  return useMutation({ mutationFn: postRifa });
};

export const usePutRifa = () => {
  return useMutation({ mutationFn: putRifa });
};
