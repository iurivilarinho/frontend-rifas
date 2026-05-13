import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/api/clients/apiClient";

export interface CurrentUserDto {
  id: number;
  login: string;
  name: string;
  email: string;
  roles?: Array<{ id: number; name: string }>;
}

const fetchCurrentUser = async (): Promise<CurrentUserDto> => {
  const { data } = await apiClient.get<CurrentUserDto>("/users/me");
  return data;
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};

export const isAdmin = (user?: CurrentUserDto | null): boolean => {
  if (!user?.roles) return false;
  return user.roles.some((r) => r.name === "ROLE_ADMIN");
};
