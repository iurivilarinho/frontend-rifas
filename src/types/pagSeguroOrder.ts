export interface PagSeguroOrder {
  id: string; // ex: "ORDE_..."
  customer: PagSeguroCustomer;
  items: PagSeguroItem[];
  charges: PagSeguroCharge[] | null; // no exemplo vem null; pode virar array conforme API
  links: PagSeguroLink[];
  reference_id: string; // vem string no payload
  created_at: string; // ISO date
  qr_codes: PagSeguroQrCode[];
  notification_urls: string[];
}

export interface PagSeguroCustomer {
  name: string;
  email: string;
  tax_id: string;
}

export interface PagSeguroItem {
  name: string;
  quantity: number;
  unit_amount: number;
}

export interface PagSeguroLink {
  rel: string; // ex: "SELF" | "PAY" | "QRCODE.PNG" | ...
  href: string;
  media: string;
  type: string; // ex: "GET" | "POST"
}

export interface PagSeguroQrCode {
  id: string; // ex: "QRCO_..."
  amount: PagSeguroAmount;
  text: string;
  arrangements: string[]; // ex: ["PIX"]
  links: PagSeguroLink[];
  expiration_date: string; // ISO date
}

export interface PagSeguroAmount {
  value: number;
}

/**
 * Opcional: se você quiser tipar charges depois.
 * Como no exemplo veio null, deixei como unknown por enquanto.
 * Quando você tiver um exemplo real com charges preenchido, dá pra detalhar.
 */
export type PagSeguroCharge = unknown;
