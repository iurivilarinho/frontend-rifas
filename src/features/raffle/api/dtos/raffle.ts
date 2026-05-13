import type { DocumentApiDto } from "@/features/document/api/dtos/document";

export interface QuotaApiDto {
  id: number;
  number: number;
  sold: boolean;
  reservationId?: number;
}

export interface RaffleApiDto {
  id?: number;
  title: string;
  description: string;
  descriptionAward: string;
  quotaPrice: number;
  numberOfShares: number;
  minPurchaseShares: number;
  maxPurchaseShares: number;
  showQuotas: boolean;
  soldPercentage?: number;
  standardSalesPercentage?: number;
  images: DocumentApiDto[];
  cover: DocumentApiDto;
  quotas: QuotaApiDto[];
}
