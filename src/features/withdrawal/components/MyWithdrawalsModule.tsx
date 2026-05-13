import { useState } from "react";
import { toast } from "sonner";
import {
  Banknote,
  CreditCard,
  Inbox,
  TrendingDown,
  Wallet,
  X,
} from "lucide-react";

import { StatusBadge, type StatusTone } from "@/components/badge/StatusBadge";
import { Button } from "@/components/button/Button";
import { KpiCard, KpiCardSkeleton } from "@/components/card/KpiCard";
import { SectionCard, SectionCardHeader } from "@/components/card/SectionCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/skeleton/Skeleton";

import type { WithdrawalStatus } from "../api/dtos";
import {
  useCancelMyWithdrawal,
  useGetMyBalance,
  useGetMyPaymentInfo,
  useGetMyWithdrawals,
} from "../api/services/useWithdrawalService";
import { PaymentInfoDialog } from "./PaymentInfoDialog";
import { WithdrawalRequestDialog } from "./WithdrawalRequestDialog";

const formatBrl = (v: number | string | null | undefined) =>
  Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso;
  }
};

const STATUS_LABEL: Record<WithdrawalStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovada",
  PAID: "Paga",
  REJECTED: "Rejeitada",
  CANCELLED: "Cancelada",
};

const STATUS_TONE: Record<WithdrawalStatus, StatusTone> = {
  PENDING: "warning",
  APPROVED: "info",
  PAID: "success",
  REJECTED: "danger",
  CANCELLED: "muted",
};

const asMessage = (e: unknown): string => {
  const msg =
    (e as { response?: { data?: { message?: string | string[] } } })?.response?.data
      ?.message;
  if (Array.isArray(msg)) return msg.join(" · ");
  if (typeof msg === "string" && msg) return msg;
  return "Falha ao processar.";
};

export const MyWithdrawalsModule = () => {
  const { data: balance, isLoading } = useGetMyBalance();
  const { data: paymentInfo } = useGetMyPaymentInfo();
  const { data: withdrawals } = useGetMyWithdrawals();
  const { mutateAsync: cancel } = useCancelMyWithdrawal();

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);

  const hasPaymentInfo = Boolean(paymentInfo?.type);

  const handleRequest = () => {
    if (!hasPaymentInfo) {
      toast.error("Cadastre seus dados de recebimento antes de solicitar.");
      setPaymentOpen(true);
      return;
    }
    if (!balance || Number(balance.available) <= 0) {
      toast.error("Sem saldo disponível para saque.");
      return;
    }
    setRequestOpen(true);
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm("Cancelar esta solicitação?")) return;
    try {
      await cancel(id);
      toast.success("Solicitação cancelada.");
    } catch (e) {
      toast.error(asMessage(e));
    }
  };

  if (isLoading || !balance) {
    return (
      <section className="flex flex-col gap-6">
        <PageHeader
          title="Saldo e saques"
          description="Acompanhe seu saldo e solicite repasses."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>
        <SectionCard>
          <SectionCardHeader icon={Inbox} title="Histórico de solicitações" />
          <ul className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="space-y-2 px-5 py-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
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
        title="Saldo e saques"
        description="Acompanhe seu saldo e solicite repasses."
        actions={
          <>
            <Button variant="outline" onClick={() => setPaymentOpen(true)}>
              <CreditCard className="mr-2 h-4 w-4" />
              {hasPaymentInfo ? "Editar recebimento" : "Cadastrar recebimento"}
            </Button>
            <Button onClick={handleRequest}>
              <Wallet className="mr-2 h-4 w-4" />
              Solicitar saque
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Banknote}
          label="Saldo disponível"
          value={formatBrl(balance.available)}
          hint={`Mínimo de saque: ${formatBrl(balance.minimumWithdrawalAmount)}`}
        />
        <KpiCard
          icon={Wallet}
          label="Total bruto"
          value={formatBrl(balance.totalGross)}
          hint="Recebido em reservas pagas."
        />
        <KpiCard
          icon={TrendingDown}
          label="Taxa retida"
          value={formatBrl(balance.totalFee)}
          hint={`${Number(balance.platformFeePercentage).toFixed(2)}% sobre o bruto`}
        />
        <KpiCard
          icon={Wallet}
          label="Já solicitado"
          value={formatBrl(balance.totalWithdrawn)}
          hint="Pendente + aprovado + pago."
        />
      </div>

      <SectionCard>
        <SectionCardHeader icon={Inbox} title="Histórico de solicitações" />
        {!withdrawals || withdrawals.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Nenhuma solicitação"
            description="Quando você solicitar um saque, vai aparecer aqui."
          />
        ) : (
          <ul className="divide-y divide-border">
            {withdrawals.map((w) => (
              <li
                key={w.id}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">
                      {formatBrl(w.netAmount)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        líq.
                      </span>
                    </span>
                    <StatusBadge tone={STATUS_TONE[w.status]}>
                      {STATUS_LABEL[w.status]}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Bruto {formatBrl(w.grossAmount)} − {Number(w.feePercentage).toFixed(2)}% taxa ·
                    Solicitado em {formatDate(w.requestedAt)}
                  </p>
                  {w.rejectionReason && (
                    <p className="mt-1 text-xs text-destructive">
                      Motivo: {w.rejectionReason}
                    </p>
                  )}
                </div>
                {w.status === "PENDING" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancel(w.id)}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Cancelar
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <PaymentInfoDialog open={paymentOpen} onOpenChange={setPaymentOpen} />
      <WithdrawalRequestDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        balance={balance}
      />
    </section>
  );
};
