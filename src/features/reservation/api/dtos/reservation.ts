export interface BuyerPayload {
  fullName: string;
  email: string;
  cpf: string;
  numberPhone: string;
}

export interface CreateReservationRequest {
  raffleId: number;
  quotaIds: number[];
  buyer: BuyerPayload;
}

export interface MercadoPagoTransactionData {
  qr_code: string;
  qr_code_base64: string;
  ticket_url: string;
}

export interface MercadoPagoPointOfInteraction {
  transaction_data: MercadoPagoTransactionData | null;
}

export interface MercadoPagoOrder {
  id: number;
  status: string;
  status_detail: string;
  payment_method_id: string;
  transaction_amount: number;
  date_of_expiration: string;
  notification_url: string;
  point_of_interaction: MercadoPagoPointOfInteraction | null;
}
