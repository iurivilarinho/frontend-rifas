import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/api/clients/apiClient";
import { resolveErrorMessage } from "@/api/utils/resolveErrorMessage";
import { resolveSuccessMessage } from "@/api/utils/resolveSuccessMessage";
import type { ApiPaginatedResponse, ApiRequestParams } from "@/api/dtos";
import type { MutationOptions, QueryOptions } from "@/api/types";
import type { UserApiDto } from "../dtos/user";

interface GetUsersFilter {
  search?: string;
  active?: boolean;
}

type GetUsersParams = ApiRequestParams<UserApiDto, GetUsersFilter>;

const getUsers = async (
  params?: GetUsersParams,
): Promise<ApiPaginatedResponse<UserApiDto>> => {
  const query = new URLSearchParams();
  const { page, size, sort, filter } = params ?? {};

  if (page !== undefined) query.append("page", String(page));
  if (size !== undefined) query.append("size", String(size));
  if (sort)
    query.append("sort", sort.map((s) => `${String(s.by)},${s.direction}`).join(","));
  if (filter?.search) query.append("search", filter.search);
  if (filter?.active !== undefined) query.append("active", String(filter.active));

  const { data } = await apiClient.get<ApiPaginatedResponse<UserApiDto>>(
    `/users?${query.toString()}`,
  );
  return data;
};

export const useGetUsers = (
  params?: GetUsersParams,
  options?: QueryOptions<ApiPaginatedResponse<UserApiDto>>,
) => {
  const { page, size, sort, filter } = params ?? {};

  return useQuery({
    queryKey: ["users", page, size, sort, filter],
    queryFn: () => getUsers(params),
    ...options,
  });
};

const getUserById = async (id: number | string): Promise<UserApiDto> => {
  const { data } = await apiClient.get<UserApiDto>(`/users/${id}`);
  return data;
};

export const useGetUserById = (
  id?: number | string,
  options?: QueryOptions<UserApiDto>,
) => {
  const enabled = Boolean(id) && (options?.enabled ?? true);

  return useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id!),
    enabled,
    ...options,
  });
};

interface CreateUserVariables {
  payload: FormData;
}

const postUser = async ({ payload }: CreateUserVariables): Promise<UserApiDto> => {
  const { data } = await apiClient.post<UserApiDto>("/users", payload);
  return data;
};

export const useCreateUser = (
  options?: MutationOptions<UserApiDto, CreateUserVariables>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postUser,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (options?.showToast !== false) {
        toast.success(
          resolveSuccessMessage({
            successMessage: options?.successMessage,
            data,
            variables,
            defaultMessage: "Usuário cadastrado com sucesso",
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
            fallbackMessage: options?.errorMessage ?? "Erro ao cadastrar usuário",
          }),
        );
      }
      options?.onError?.(error);
    },
  });
};

interface UpdateUserVariables {
  id: number | string;
  payload: FormData;
}

const putUser = async ({ id, payload }: UpdateUserVariables): Promise<UserApiDto> => {
  const { data } = await apiClient.put<UserApiDto>(`/users/${id}`, payload);
  return data;
};

export const useUpdateUser = (
  options?: MutationOptions<UserApiDto, UpdateUserVariables>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: putUser,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      if (options?.showToast !== false) {
        toast.success(
          resolveSuccessMessage({
            successMessage: options?.successMessage,
            data,
            variables,
            defaultMessage: "Usuário atualizado com sucesso",
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
            fallbackMessage: options?.errorMessage ?? "Erro ao atualizar usuário",
          }),
        );
      }
      options?.onError?.(error);
    },
  });
};
