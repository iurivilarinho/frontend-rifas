import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Inbox, RotateCcw } from "lucide-react";

import { StatusBadge } from "@/components/badge/StatusBadge";
import { Button } from "@/components/button/Button";
import { SectionCard } from "@/components/card/SectionCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { FilterPills } from "@/components/filter/FilterPills";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Loading } from "@/components/Loading";
import { TableRoot } from "@/components/table/Table";
import { TableContent } from "@/components/table/TableContent";
import {
  type Pagination,
  TablePagination,
} from "@/components/table/TablePagination";
import { usePagination } from "@/hooks/usePagination";

import type { RaffleBuyerApiDto } from "../api/dtos/buyer";
import { useGetRaffleById, useRefundReservation } from "../api/services/useRaffleService";
import {
  buildSalesXlsxUrl,
  useGetRaffleBuyers,
} from "../api/services/useRaffleBuyersService";

const formatBrl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso;
  }
};

type Filter = "all" | "paid" | "pending";

const FILTER_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "paid", label: "Pagas" },
  { value: "pending", label: "Aguardando" },
] as const satisfies ReadonlyArray<{ value: Filter; label: string }>;

export const RaffleBuyersPage = () => {
  const navigate = useNavigate();
  const { raffleId } = useParams();
  const id = raffleId ? Number(raffleId) : undefined;

  const [filter, setFilter] = useState<Filter>("all");
  const { page, size, onPageChange, onSizeChange } = usePagination({
    initialPage: 0,
    initialSize: 20,
    resetDeps: [filter],
  });

  const { data: raffle } = useGetRaffleById(id);
  const { data, isLoading, error } = useGetRaffleBuyers({
    raffleId: id!,
    page,
    size,
    filter: filter === "all" ? undefined : { paid: filter === "paid" },
  });

  const { mutateAsync: refund, isPending: isRefunding } = useRefundReservation();

  const handleRefund = async (reservationId: number) => {
    const reason = window.prompt(
      "Confirmar estorno? (informe uma observação opcional)",
      "",
    );
    if (reason === null) return;
    await refund({ reservationId, notes: reason });
  };

  const columns: ColumnDef<RaffleBuyerApiDto>[] = useMemo(
    () => [
      {
        id: "fullName",
        accessorKey: "fullName",
        header: "Comprador",
        cell: (ctx) => (
          <span className="font-medium text-foreground">{ctx.getValue<string>()}</span>
        ),
      },
      {
        id: "cpf",
        accessorKey: "cpf",
        header: "CPF",
        size: 140,
      },
      {
        id: "contato",
        header: "Contato",
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground">
            <p>{row.original.email}</p>
            <p>{row.original.phone}</p>
          </div>
        ),
      },
      {
        id: "quantity",
        accessorKey: "quantity",
        header: "Cotas",
        size: 80,
        cell: ({ row }) => (
          <span title={row.original.quotaNumbers.join(", ")}>{row.original.quantity}</span>
        ),
      },
      {
        id: "totalAmount",
        accessorKey: "totalAmount",
        header: "Total",
        size: 120,
        cell: (ctx) => (
          <span className="font-medium">{formatBrl(ctx.getValue<number>())}</span>
        ),
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Data",
        size: 160,
        cell: (ctx) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(ctx.getValue<string>())}
          </span>
        ),
      },
      {
        id: "paid",
        accessorKey: "paid",
        header: "Status",
        size: 120,
        cell: (ctx) => {
          const paid = ctx.getValue<boolean>();
          return (
            <StatusBadge tone={paid ? "success" : "warning"}>
              {paid ? "Pago" : "Aguardando"}
            </StatusBadge>
          );
        },
      },
      {
        id: "actions",
        header: "",
        size: 110,
        cell: ({ row }) => {
          if (!row.original.paid) return null;
          return (
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isRefunding}
                onClick={() => handleRefund(row.original.reservationId)}
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Estornar
              </Button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isRefunding],
  );

  if (!id) {
    return (
      <PageShell>
        <EmptyState title="Rifa inválida" description="ID não informado na URL." />
      </PageShell>
    );
  }
  if (isLoading) return <Loading />;
  if (error)
    return (
      <PageShell>
        <p className="text-sm text-destructive">Erro: {(error as Error).message}</p>
      </PageShell>
    );

  const buyers = data?.content ?? [];

  const pagination: Pagination = {
    page: (data?.number ?? 0) + 1,
    size: data?.size ?? size,
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 1,
    first: data?.first ?? true,
    last: data?.last ?? true,
  };

  return (
    <PageShell>
      <button
        type="button"
        onClick={() => navigate("/panel?tab=dashboard")}
        className="mb-2 text-xs text-primary hover:underline"
      >
        ← Voltar ao painel
      </button>

      <PageHeader
        title={`Compradores · ${raffle?.title ?? `Rifa #${id}`}`}
        description={`${data?.totalElements ?? 0} reservas encontradas.`}
        actions={
          <a href={buildSalesXlsxUrl(id)} target="_blank" rel="noreferrer">
            <Button type="button" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </a>
        }
      />

      <FilterPills
        className="mb-4"
        size="sm"
        options={FILTER_OPTIONS}
        value={filter}
        onChange={setFilter}
      />

      <SectionCard>
        {buyers.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Sem compradores"
            description="Nenhuma reserva encontrada para este filtro."
          />
        ) : (
          <>
            <TableRoot<RaffleBuyerApiDto>
              data={buyers}
              columns={columns}
              tableId="raffle-buyers-table"
              fillContainerWidth
            >
              <TableContent stickyHeader />
            </TableRoot>
            <TablePagination
              pagination={pagination}
              onPageChange={(page1Based) => onPageChange(Math.max(0, page1Based - 1))}
              onPageSizeChange={onSizeChange}
              isSticky
            />
          </>
        )}
      </SectionCard>
    </PageShell>
  );
};
