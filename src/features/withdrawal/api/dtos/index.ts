export type WithdrawalStatus =
  | "PENDING"
  | "APPROVED"
  | "PAID"
  | "REJECTED"
  | "CANCELLED";

export type PaymentMethodType = "PIX" | "BANK_ACCOUNT";
export type PixKeyType = "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM";
export type BankAccountType = "CHECKING" | "SAVINGS";

export interface PlatformSettingsApiDto {
  platformFeePercentage: number;
  minimumWithdrawalAmount: number;
  updatedAt?: string;
}

export interface UserPaymentInfoApiDto {
  id: number;
  type: PaymentMethodType;
  pixKey?: string | null;
  pixKeyType?: PixKeyType | null;
  bankCode?: string | null;
  bankName?: string | null;
  agency?: string | null;
  accountNumber?: string | null;
  accountType?: BankAccountType | null;
  holderName?: string | null;
  holderDocument?: string | null;
}

export interface BalanceApiDto {
  totalGross: number;
  platformFeePercentage: number;
  totalFee: number;
  totalNet: number;
  totalWithdrawn: number;
  available: number;
  minimumWithdrawalAmount: number;
}

export interface WithdrawalApiDto {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  grossAmount: number;
  feePercentage: number;
  feeAmount: number;
  netAmount: number;
  status: WithdrawalStatus;
  paymentSnapshot?: string | null;
  requestedAt: string;
  processedAt?: string | null;
  notes?: string | null;
  rejectionReason?: string | null;
}
