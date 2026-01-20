import { PageResponse } from "@/types/PageReseponse";
import { User } from "@/types/user";
import { useMutation, useQuery } from "@tanstack/react-query";
import httpRequest from "../axios/httpRequests";

const postUser = async (User: FormData) => {
  const { data } = await httpRequest.post("/users", User);
  return data;
};

interface PutUserParams {
  user: FormData;
  id: number | string;
}

const putUser = async ({ id, user }: PutUserParams) => {
  const { data } = await httpRequest.put(`/users/${id}`, user);
  return data;
};

export function useGetUser(params: { page: number; size: number }) {
  return useQuery({
    queryKey: ["users", params.page, params.size],
    queryFn: async () => {
      const res = await httpRequest.get<PageResponse<User>>("/users", {
        params: { page: params.page, size: params.size },
      });
      return res.data;
    },
  });
}

export const usePostUser = () => {
  return useMutation({ mutationFn: postUser });
};

export const usePutUser = () => {
  return useMutation({ mutationFn: putUser });
};
export function useGetUserById(
  userId: string,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? Boolean(userId);

  return useQuery({
    queryKey: ["userById", userId],
    enabled,
    queryFn: async () => {
      // garantia extra: se alguém chamar sem id, não bate na API
      if (!userId) {
        throw new Error("userId é obrigatório para buscar usuário por id");
      }

      const res = await httpRequest.get<User>(`/users/${userId}`);
      return res.data;
    },
  });
}
