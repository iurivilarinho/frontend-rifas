import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/clients/apiClient";
import type { QueryOptions } from "@/api/types";
import type { DocumentApiDto } from "../dtos/document";

const getDocumentById = async (id: number | string): Promise<DocumentApiDto> => {
  const { data } = await apiClient.get<DocumentApiDto>(`/documents/${id}`);
  return data;
};

export const useGetDocumentById = (
  id?: number | string | null,
  options?: QueryOptions<DocumentApiDto>,
) => {
  const enabled = id !== null && id !== undefined && (options?.enabled ?? true);

  return useQuery({
    queryKey: ["document", id],
    queryFn: () => getDocumentById(id!),
    enabled,
    ...options,
  });
};
