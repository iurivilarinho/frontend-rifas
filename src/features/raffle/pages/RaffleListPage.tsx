import { CheckCircle2, Ticket, Trophy } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { StatusBadge } from "@/components/badge/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent } from "@/components/ui/Card";
import { PushNotificationsToggle } from "@/features/push";

import { RaffleCardSkeleton } from "../components/RaffleCardSkeleton";

import type { RaffleApiDto } from "../api/dtos/raffle";
import {
  useGetRaffles,
  useGetRafflesByCpf,
} from "../api/services/useRaffleService";
import { RaffleProgressBar } from "../components/RaffleProgressBar";
import { RaffleThumb } from "../components/RaffleThumb";

const formatBrl = (reais: number) =>
  Number(reais ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

type RaffleCardProps = {
  raffle: RaffleApiDto;
  onClick: () => void;
};

const RaffleCard = ({ raffle, onClick }: RaffleCardProps) => {
  const porcentagem = Math.max(
    raffle.soldPercentage ?? 0,
    raffle.standardSalesPercentage ?? 0,
  );
  const soldOut = porcentagem >= 100;

  return (
    <Card
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group flex cursor-pointer flex-col overflow-hidden border-border transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:-translate-y-0.5 focus-visible:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        <RaffleThumb
          documentId={raffle.cover?.id}
          alt={raffle.cover?.name ?? raffle.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute right-2 top-2">
          <StatusBadge tone={soldOut ? "muted" : "success"}>
            {soldOut ? "Esgotada" : "Disponível"}
          </StatusBadge>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 p-4 pt-4">
        <div>
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-foreground">
            {raffle.title}
          </h3>
          {raffle.descriptionAward && (
            <p className="mt-1 line-clamp-2 inline-flex items-start gap-1 text-xs text-muted-foreground">
              <Trophy className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
              <span>{raffle.descriptionAward}</span>
            </p>
          )}
        </div>

        <RaffleProgressBar porcentagem={porcentagem} size="sm" />

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Cota a partir de
            </p>
            <p className="text-lg font-semibold text-primary">
              {formatBrl(raffle.quotaPrice)}
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-primary" />
              {porcentagem.toFixed(1)}% vendido
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const RaffleListPage = () => {
  const navigate = useNavigate();
  const { cpf } = useParams();
  const hasCpf = !!cpf && cpf.trim().length > 0;

  const allQuery = useGetRaffles({ enabled: !hasCpf });
  const byCpfQuery = useGetRafflesByCpf(cpf, { enabled: hasCpf });

  const error = hasCpf ? byCpfQuery.error : allQuery.error;
  const raffles = hasCpf ? byCpfQuery.data : allQuery.data;
  const isFirstLoad = raffles === undefined && !error;

  const handleClick = (id?: number) => {
    if (!id) return;
    navigate(hasCpf ? `/raffle/${id}/${cpf}` : `/raffle/${id}`);
  };

  if (error) {
    return (
      <PageShell>
        <p className="text-sm text-destructive">
          Erro ao carregar dados: {(error as Error).message}
        </p>
      </PageShell>
    );
  }

  if (isFirstLoad) {
    return (
      <PageShell withTopNav={false}>
        <PageHeader
          title={hasCpf ? "Minhas compras" : "Rifas disponíveis"}
          description={
            hasCpf
              ? "Acompanhe as rifas em que você adquiriu cotas."
              : "Escolha uma rifa para participar."
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <RaffleCardSkeleton key={i} />
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell withTopNav={false}>
      <PageHeader
        title={hasCpf ? "Minhas compras" : "Rifas disponíveis"}
        description={
          hasCpf
            ? "Acompanhe as rifas em que você adquiriu cotas."
            : "Escolha uma rifa para participar."
        }
        actions={hasCpf ? <PushNotificationsToggle topic="raffle-buyer" /> : undefined}
      />

      {!raffles || raffles.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Nenhuma rifa encontrada"
          description={
            hasCpf
              ? "Você ainda não tem compras associadas a esse CPF."
              : "Não há rifas publicadas no momento. Volte em breve!"
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {raffles.map((raffle) => (
            <RaffleCard
              key={raffle.id}
              raffle={raffle}
              onClick={() => handleClick(raffle.id)}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
};
