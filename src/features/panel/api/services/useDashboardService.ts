import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/clients/apiClient";
import type { QueryOptions } from "@/api/types";
import type { DashboardApiDto } from "../dtos/dashboard";

const getDashboard = async (): Promise<DashboardApiDto> => {
  const { data } = await apiClient.get<DashboardApiDto>("/dashboard");
  return data;
};

export const useGetDashboard = (options?: QueryOptions<DashboardApiDto>) => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    ...options,
  });
};
