// Mercado Pago (Payment API) - tipos equivalentes ao seu modelo do PagBank/PagSeguro

export interface MercadoPagoOrder {
  id: number; // ex: 142802623940
  status: string; // ex: "pending"
  status_detail: string; // ex: "pending_waiting_transfer"
  payment_method_id: string; // ex: "pix"
  transaction_amount: number; // ex: 12.34
  date_of_expiration: string; // ISO date-time (OffsetDateTime no Java) ex: "2026-01-20T18:30:00.000-04:00"
  notification_url: string; // webhook
  additional_info: MercadoPagoAdditionalInfo | null;
  payer: MercadoPagoPayer | null;
  point_of_interaction: MercadoPagoPointOfInteraction | null;
}

export interface MercadoPagoAdditionalInfo {
  items: MercadoPagoItem[];
}

export interface MercadoPagoItem {
  category_id: string; // ex: "Tickets"
  description: string; // ex: "Natal Iluminado 2019"
  id: string; // ex: "1941"
  quantity: string; // pode vir string no retorno
  title: string; // ex: "Ingresso Antecipado"
  unit_price: string; // pode vir string no retorno, ex: "100.0"
}

export interface MercadoPagoPayer {
  first_name: string;
  last_name: string;
  email: string;
  identification: MercadoPagoIdentification | null;
}

export interface MercadoPagoIdentification {
  type: string; // ex: "CPF"
  number: string; // ex: "13953129660"
}

export interface MercadoPagoPointOfInteraction {
  transaction_data: MercadoPagoTransactionData | null;
}

export interface MercadoPagoTransactionData {
  qr_code: string; // copia e cola Pix
  qr_code_base64: string; // imagem base64
  ticket_url: string; // url do ticket
}
