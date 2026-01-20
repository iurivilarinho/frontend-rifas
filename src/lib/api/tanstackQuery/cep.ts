import { useQuery } from "@tanstack/react-query";
import httpRequestCep from "../axios/httpRequestsCep";

const getCEP = async (cep: string) => {
  const { data } = await httpRequestCep.get(`${cep}/json/`);
  return data;
};

export const useGetCEP = (cepRaw: string) => {
  const cep = (cepRaw ?? "").replace(/\D/g, "");
  const enabled = cep.length === 8;

  return useQuery({
    queryKey: ["cep", cep],
    enabled,
    queryFn: () => getCEP(cep),
  });
};
