import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Inbox, X, Wallet } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge, type StatusTone } from "@/components/badge/StatusBadge";
import { SectionCard } from "@/components/card/SectionCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { FilterPills } from "@/components/filter/FilterPills";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  TableActionsDropdown,
  type ColumnAction,
} from "@/components/table/components/TableActionsDropdown";
import { TableRoot } from "@/components/table/Table";
import { TableContent } from "@/components/table/TableContent";
import { TableSkeleton } from "@/components/table/TableSkeleton";

import type { WithdrawalApiDto, WithdrawalStatus } from "../api/dtos";
import {
  useApproveWithdrawal,
  useGetAdminWithdrawals,
  useMarkWithdrawalPaid,
  useRejectWithdrawal,
} from "../api/services/useWithdrawalService";

type StatusFilter = "ALL" | WithdrawalStatus;

const FILTER_OPTIONS = [
  { value: "ALL", label: "Todas" },
  { value: "PENDING", label: "Pendentes" },
  { value: "APPROVED", label: "Aprovadas" },
  { value: "PAID", label: "Pagas" },
  { value: "REJECTED", label: "Rejeitadas" },
  { value: "CANCELLED", label: "Canceladas" },
] as const satisfies ReadonlyArray<{ value: StatusFilter; label: string }>;

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

type SnapshotShape = {
  type?: string;
  pixKey?: string;
  pixKeyType?: string;
  bankCode?: string;
  bankName?: string;
  agency?: string;
  accountNumber?: string;
  accountType?: string;
  holderName?: string;
  holderDocument?: string;
};

const parseSnapshot = (raw: string | null | undefined): SnapshotShape | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SnapshotShape;
  } catch {
    return null;
  }
};

const renderPaymentSnapshot = (raw: string | null | undefined) => {
  const snap = parseSnapshot(raw);
  if (!snap) return <span className="text-xs text-muted-foreground">—</span>;
  if (snap.type === "PIX") {
    return (
      <span className="text-xs text-muted-foreground">
        Pix {snap.pixKeyType ? `(${snap.pixKeyType})` : ""}: {snap.pixKey}
      </span>
    );
  }
  return (
    <span className="text-xs text-muted-foreground">
      {snap.bankName ?? snap.bankCode ?? "Banco"} · Ag {snap.agency} · Conta{" "}
      {snap.accountNumber}
    </span>
  );
};

export const AdminWithdrawalsModule = () => {
  const [filter, setFilter] = useState<StatusFilter>("PENDING");
  const status = filter === "ALL" ? undefined : (filter as WithdrawalStatus);
  const { data, isLoading } = useGetAdminWithdrawals({ status, page: 0, size: 50 });

  const { mutateAsync: approve, isPending: isApproving } = useApproveWithdrawal();
  const { mutateAsync: markPaid, isPending: isPaying } = useMarkWithdrawalPaid();
  const { mutateAsync: reject, isPending: isRejecting } = useRejectWithdrawal();

  const handleApprove = async (id: number) => {
    try {
      await approve(id);
      toast.success("Solicitação aprovada.");
    } catch (e) {
      toast.error(asMessage(e));
    }
  };

  const handlePaid = async (id: number) => {
    try {
      await markPaid(id);
      toast.success("Solicitação marcada como paga.");
    } catch (e) {
      toast.error(asMessage(e));
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt("Motivo da rejeição:");
    if (!reason || !reason.trim()) return;
    try {
      await reject({ id, reason: reason.trim() });
      toast.success("Solicitação rejeitada.");
    } catch (e) {
      toast.error(asMessage(e));
    }
  };

  const columns: ColumnDef<WithdrawalApiDto>[] = useMemo(
    () => [
      {
        id: "user",
        header: "Solicitante",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {row.original.userName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.userEmail}
            </p>
          </div>
        ),
      },
      {
        id: "amounts",
        header: "Valor",
        size: 180,
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="font-semibold text-foreground">
              {formatBrl(row.original.netAmount)}{" "}
              <span className="text-xs font-normal text-muted-foreground">líq.</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {formatBrl(row.original.grossAmount)} − {row.original.feePercentage}% taxa
            </p>
          </div>
        ),
      },
      {
        id: "payment",
        header: "Forma de recebimento",
        cell: ({ row }) => renderPaymentSnapshot(row.original.paymentSnapshot),
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        size: 130,
        cell: (ctx) => {
          const v = ctx.getValue<WithdrawalStatus>();
          return <StatusBadge tone={STATUS_TONE[v]}>{STATUS_LABEL[v]}</StatusBadge>;
        },
      },
      {
        id: "requestedAt",
        accessorKey: "requestedAt",
        header: "Solicitado em",
        size: 160,
        cell: (ctx) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(ctx.getValue<string>())}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        size: 56,
        cell: ({ row }) => {
          const w = row.original;
          const actions: ColumnAction[] = [];
          if (w.status === "PENDING") {
            actions.push({
              label: "Aprovar",
              icon: <Check className="h-4 w-4" />,
              onClick: () => handleApprove(w.id),
            });
          }
          if (w.status === "PENDING" || w.status === "APPROVED") {
            actions.push({
              label: "Marcar como paga",
              icon: <Wallet className="h-4 w-4" />,
              onClick: () => handlePaid(w.id),
            });
            actions.push({
              label: "Rejeitar",
              icon: <X className="h-4 w-4" />,
              onClick: () => handleReject(w.id),
            });
          }
          if (actions.length === 0) return null;
          return (
            <div className="flex justify-end">
              <TableActionsDropdown row={row} columnActions={actions} subtle />
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isApproving, isPaying, isRejecting],
  );

  const items = data?.content ?? [];

  return (
    <section className="flex flex-col gap-4">
      <PageHeader
        title="Solicitações de saque"
        description="Aprove, rejeite ou marque como pagas as solicitações dos usuários."
      />

      <FilterPills
        size="sm"
        options={FILTER_OPTIONS}
        value={filter}
        onChange={setFilter}
      />

      {isLoading ? (
        <SectionCard>
          <TableSkeleton rows={6} columns={5} />
        </SectionCard>
      ) : items.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon={Inbox}
            title="Sem solicitações"
            description="Quando alguém solicitar um saque, vai aparecer aqui."
          />
        </SectionCard>
      ) : (
        <SectionCard>
          <TableRoot<WithdrawalApiDto>
            data={items}
            columns={columns}
            tableId="admin-withdrawals-table"
            fillContainerWidth
          >
            <TableContent stickyHeader />
          </TableRoot>
        </SectionCard>
      )}
    </section>
  );
};

const asMessage = (e: unknown): string => {
  const msg =
    (e as { response?: { data?: { message?: string | string[] } } })?.response?.data
      ?.message;
  if (Array.isArray(msg)) return msg.join(" · ");
  if (typeof msg === "string" && msg) return msg;
  return "Falha ao processar a solicitação.";
};
