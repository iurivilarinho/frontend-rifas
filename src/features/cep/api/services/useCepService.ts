import { useQuery } from "@tanstack/react-query";
import { cepClient } from "@/api/clients/cepClient";
import type { QueryOptions } from "@/api/types";
import type { CepApiDto } from "../dtos/cep";

const getCep = async (cep: string): Promise<CepApiDto> => {
  const { data } = await cepClient.get<CepApiDto>(`/${cep}/json/`);
  return data;
};

export const useGetCep = (cepRaw: string, options?: QueryOptions<CepApiDto>) => {
  const cep = (cepRaw ?? "").replace(/\D/g, "");
  const enabled = cep.length === 8 && (options?.enabled ?? true);

  return useQuery({
    queryKey: ["cep", cep],
    queryFn: () => getCep(cep),
    enabled,
    ...options,
  });
};
