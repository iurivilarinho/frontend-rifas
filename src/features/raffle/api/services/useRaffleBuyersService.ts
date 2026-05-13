import { useQuery } from "@tanstack/react-query";
import { apiClient, apiBaseUrl } from "@/api/clients/apiClient";
import type { ApiPaginatedResponse, ApiRequestParams } from "@/api/dtos";
import type { QueryOptions } from "@/api/types";
import type { RaffleBuyerApiDto } from "../dtos/buyer";

interface BuyersFilter {
  paid?: boolean;
}

type GetBuyersParams = ApiRequestParams<RaffleBuyerApiDto, BuyersFilter> & {
  raffleId: number | string;
};

const getBuyers = async (
  params: GetBuyersParams,
): Promise<ApiPaginatedResponse<RaffleBuyerApiDto>> => {
  const { raffleId, page, size, filter } = params;
  const query = new URLSearchParams();
  if (page !== undefined) query.append("page", String(page));
  if (size !== undefined) query.append("size", String(size));
  if (filter?.paid !== undefined) query.append("paid", String(filter.paid));

  const { data } = await apiClient.get<ApiPaginatedResponse<RaffleBuyerApiDto>>(
    `/rifas/${raffleId}/buyers?${query.toString()}`,
  );
  return data;
};

export const useGetRaffleBuyers = (
  params: GetBuyersParams,
  options?: QueryOptions<ApiPaginatedResponse<RaffleBuyerApiDto>>,
) => {
  const { raffleId, page, size, filter } = params;
  return useQuery({
    queryKey: ["raffle-buyers", raffleId, page, size, filter],
    queryFn: () => getBuyers(params),
    enabled: Boolean(raffleId),
    ...options,
  });
};

export const buildSalesXlsxUrl = (raffleId: number | string): string => {
  return `${apiBaseUrl}/rifas/${raffleId}/sales.xlsx`;
};
