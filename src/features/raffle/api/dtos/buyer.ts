export interface RaffleBuyerApiDto {
  reservationId: number;
  buyerId: number;
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  paid: boolean;
  createdAt: string;
  quantity: number;
  totalAmount: number;
  quotaNumbers: number[];
}
