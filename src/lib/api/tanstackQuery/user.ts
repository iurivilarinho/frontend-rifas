import { useMutation, useQuery } from "@tanstack/react-query";
import httpRequest from "../axios/httpRequests";

const postUser = async (User: FormData) => {
  const { data } = await httpRequest.post("/users", User);
  return data;
};


interface PutUserParams {
  user: FormData;
  id: number | string
}

const putUser = async ({ id, user }: PutUserParams) => {
  const { data } = await httpRequest.put(`/users/${id}`, user);
  return data;
};

const getUser = async (filter?: string) => {
  const { data } = await httpRequest.get(`/users?${filter ?? ""}`);
  return data;
};


const getUserById = async (id: number | string) => {
  const { data } = await httpRequest.get(`/users/${id}`);
  return data;
};

export const useGetUser = (filter?: string) => {
  return useQuery({
    queryKey: ["users", filter],
    queryFn: () => getUser(filter),
  });
};

export const useGetUserById = (id: number | string) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => getUserById(id),
  });
};

export const usePostUser = () => {
  return useMutation({ mutationFn: postUser });
};

export const usePutUser = () => {
  return useMutation({ mutationFn: putUser });
};
