// src/lib/api/tanstackQuery/document.ts
import { useQuery } from "@tanstack/react-query";
import httpRequest from "../axios/httpRequests";
import type { Document } from "@/types/document";

const getDocumentById = async (id: number | string): Promise<Document> => {
  const { data } = await httpRequest.get<Document>(`/documents/${id}`);
  return data;
};

export const useGetDocumentById = (id: number | string | null) => {
  return useQuery<Document>({
    queryKey: ["documents", id],
    queryFn: () => {
      if (id === null) {
        return Promise.reject(new Error("Document id não informado"));
      }
      return getDocumentById(id);
    },
    enabled: id !== null,
  });
};
