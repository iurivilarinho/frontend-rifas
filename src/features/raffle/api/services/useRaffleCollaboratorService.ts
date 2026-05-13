import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api/clients/apiClient";

import type {
  AddRaffleCollaboratorRequest,
  RaffleCollaboratorApiDto,
} from "../dtos/collaborator";

const listKey = (raffleId: number | string) => [
  "raffle-collaborators",
  String(raffleId),
];

const listCollaborators = async (
  raffleId: number | string,
): Promise<RaffleCollaboratorApiDto[]> => {
  const { data } = await apiClient.get<RaffleCollaboratorApiDto[]>(
    `/rifas/${raffleId}/collaborators`,
  );
  return data;
};

const addCollaborator = async (
  raffleId: number | string,
  payload: AddRaffleCollaboratorRequest,
): Promise<RaffleCollaboratorApiDto> => {
  const { data } = await apiClient.post<RaffleCollaboratorApiDto>(
    `/rifas/${raffleId}/collaborators`,
    payload,
  );
  return data;
};

const removeCollaborator = async (
  raffleId: number | string,
  userId: number,
): Promise<void> => {
  await apiClient.delete(`/rifas/${raffleId}/collaborators/${userId}`);
};

export const useGetRaffleCollaborators = (
  raffleId?: number | string | null,
  options?: { enabled?: boolean },
) => {
  const enabled = raffleId != null && (options?.enabled ?? true);
  return useQuery({
    queryKey: listKey(raffleId ?? ""),
    queryFn: () => listCollaborators(raffleId!),
    enabled,
  });
};

export const useAddRaffleCollaborator = (raffleId: number | string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddRaffleCollaboratorRequest) =>
      addCollaborator(raffleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKey(raffleId) });
    },
  });
};

export const useRemoveRaffleCollaborator = (raffleId: number | string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => removeCollaborator(raffleId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKey(raffleId) });
    },
  });
};
