import { Document } from "./document";

export interface Action {
  id?: number;
  description: string;
  title: string;
  descriptionAward: string;
  quotaPrice: number;
  images: Document[];
  cover: Document;
  showQuotas: boolean;
  quotas: Cota[];
  numberOfShares: number;
  soldPercentage?: number;
  standardSalesPercentage?: number;
}
