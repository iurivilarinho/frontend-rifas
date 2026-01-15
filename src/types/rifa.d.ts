import { boolean } from "zod";
import { Document } from "./document";

export interface Rifa {
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
}
