export interface RaffleFinancialSummary {
  raffleId: number;
  title: string;
  status: string;
  paid: number;
  reserved: number;
  soldQuotas: number;
  totalQuotas: number;
  soldPercentage: number;
}

export interface DashboardApiDto {
  totalPaid: number;
  totalReserved: number;
  totalRaffles: number;
  openRaffles: number;
  drawnRaffles: number;
  uniqueBuyers: number;
  totalSoldQuotas: number;
  raffles: RaffleFinancialSummary[];
}
