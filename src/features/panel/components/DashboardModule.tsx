import { Banknote, CheckCircle2, Clock, ListChecks, Trophy, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { RaffleStatusBadge } from "@/components/badge/StatusBadge";
import { KpiCard, KpiCardSkeleton } from "@/components/card/KpiCard";
import { SectionCard, SectionCardHeader } from "@/components/card/SectionCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { useGetDashboard } from "../api/services/useDashboardService";
import type { RaffleFinancialSummary } from "../api/dtos/dashboard";

const formatBrl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const DashboardModule = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetDashboard();

  if (error)
    return (
      <div className="text-sm text-destructive">
        Erro ao carregar dashboard: {(error as Error).message}
      </div>
    );

  if (isLoading || !data) {
    return (
      <section className="flex flex-col gap-6">
        <PageHeader
          title="Visão geral"
          description="Saldo consolidado, status das rifas e indicadores rápidos."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>
        <SectionCard>
          <SectionCardHeader icon={Trophy} title="Saldo por rifa" />
          <ul className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 px-5 py-4"
              >
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton className="ml-auto h-4 w-20" />
                  <Skeleton className="ml-auto h-3 w-16" />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Visão geral"
        description="Saldo consolidado, status das rifas e indicadores rápidos."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Banknote}
          label="Saldo recebido"
          value={formatBrl(data.totalPaid)}
          hint="Reservas pagas, líquido de estornos manuais."
        />
        <KpiCard
          icon={Clock}
          label="Aguardando pagamento"
          value={formatBrl(data.totalReserved)}
          hint="Reservas em aberto."
        />
        <KpiCard
          icon={ListChecks}
          label="Rifas cadastradas"
          value={String(data.totalRaffles)}
          hint={`${data.openRaffles} abertas · ${data.drawnRaffles} sorteadas`}
        />
        <KpiCard
          icon={Users}
          label="Compradores únicos"
          value={String(data.uniqueBuyers)}
          hint={`${data.totalSoldQuotas} cotas vendidas`}
        />
      </div>

      <SectionCard>
        <SectionCardHeader
          icon={Trophy}
          title="Saldo por rifa"
          hint="Clique em uma rifa para abrir os compradores."
        />

        {data.raffles.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="Sem rifas cadastradas"
            description="Crie a primeira rifa para começar a acompanhar os indicadores aqui."
          />
        ) : (
          <ul className="divide-y divide-border">
            {data.raffles.map((raffle: RaffleFinancialSummary) => (
              <li key={raffle.raffleId}>
                <button
                  type="button"
                  onClick={() => navigate(`/raffle/${raffle.raffleId}/buyers`)}
                  className="grid w-full grid-cols-1 gap-3 px-5 py-4 text-left transition-colors hover:bg-muted sm:grid-cols-[1fr,auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-foreground">{raffle.title}</p>
                      <RaffleStatusBadge status={raffle.status} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        {raffle.soldQuotas}/{raffle.totalQuotas} cotas
                      </span>
                      <span className="text-muted-foreground/60">·</span>
                      <span>{raffle.soldPercentage.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      {formatBrl(raffle.paid)}
                    </span>
                    {raffle.reserved > 0 && (
                      <span className="text-xs text-muted-foreground">
                        + {formatBrl(raffle.reserved)} reservado
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </section>
  );
};
