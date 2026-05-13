import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api/clients/apiClient";

import type {
  BalanceApiDto,
  PlatformSettingsApiDto,
  UserPaymentInfoApiDto,
  WithdrawalApiDto,
  WithdrawalStatus,
} from "../dtos";

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

/* ===== Platform Settings ===== */

export const useGetPlatformSettings = () =>
  useQuery({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      const { data } = await apiClient.get<PlatformSettingsApiDto>(
        "/platform/settings",
      );
      return data;
    },
  });

export const useUpdatePlatformSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      platformFeePercentage: number;
      minimumWithdrawalAmount: number;
    }) => {
      const { data } = await apiClient.put<PlatformSettingsApiDto>(
        "/platform/settings",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-settings"] });
      qc.invalidateQueries({ queryKey: ["balance", "me"] });
    },
  });
};

/* ===== User Payment Info ===== */

export const useGetMyPaymentInfo = () =>
  useQuery({
    queryKey: ["payment-info", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<UserPaymentInfoApiDto | null>(
        "/me/payment-info",
      );
      return data;
    },
  });

export const useUpsertMyPaymentInfo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<UserPaymentInfoApiDto> & { type: string }) => {
      const { data } = await apiClient.put<UserPaymentInfoApiDto>(
        "/me/payment-info",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment-info", "me"] });
    },
  });
};

/* ===== Balance + Withdrawals (user) ===== */

export const useGetMyBalance = () =>
  useQuery({
    queryKey: ["balance", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<BalanceApiDto>("/me/balance");
      return data;
    },
  });

export const useGetMyWithdrawals = () =>
  useQuery({
    queryKey: ["withdrawals", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<WithdrawalApiDto[]>("/me/withdrawals");
      return data;
    },
  });

export const useRequestWithdrawal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { grossAmount: number; notes?: string }) => {
      const { data } = await apiClient.post<WithdrawalApiDto>(
        "/me/withdrawals",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["balance", "me"] });
      qc.invalidateQueries({ queryKey: ["withdrawals", "me"] });
      qc.invalidateQueries({ queryKey: ["withdrawals", "admin"] });
    },
  });
};

export const useCancelMyWithdrawal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete<WithdrawalApiDto>(
        `/me/withdrawals/${id}`,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["balance", "me"] });
      qc.invalidateQueries({ queryKey: ["withdrawals", "me"] });
    },
  });
};

/* ===== Admin ===== */

interface AdminListParams {
  status?: WithdrawalStatus;
  page?: number;
  size?: number;
}

export const useGetAdminWithdrawals = (params: AdminListParams) =>
  useQuery({
    queryKey: ["withdrawals", "admin", params],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params.status) q.append("status", params.status);
      q.append("page", String(params.page ?? 0));
      q.append("size", String(params.size ?? 20));
      const { data } = await apiClient.get<PageResponse<WithdrawalApiDto>>(
        `/admin/withdrawals?${q.toString()}`,
      );
      return data;
    },
  });

export const useApproveWithdrawal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.patch<WithdrawalApiDto>(
        `/admin/withdrawals/${id}/approve`,
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["withdrawals", "admin"] }),
  });
};

export const useMarkWithdrawalPaid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.patch<WithdrawalApiDto>(
        `/admin/withdrawals/${id}/paid`,
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["withdrawals", "admin"] }),
  });
};

export const useRejectWithdrawal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const { data } = await apiClient.patch<WithdrawalApiDto>(
        `/admin/withdrawals/${id}/reject`,
        { reason },
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["withdrawals", "admin"] }),
  });
};
