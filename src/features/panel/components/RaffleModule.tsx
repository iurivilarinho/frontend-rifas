import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Download,
  Eye,
  Flag,
  ListChecks,
  Pencil,
  Plus,
  Share2,
  ShoppingCart,
  Trophy,
  Users as UsersIcon,
  XCircle,
} from "lucide-react";

import {
  RAFFLE_STATUS_LABEL,
  RaffleStatusBadge,
} from "@/components/badge/StatusBadge";
import { Button } from "@/components/button/Button";
import { SectionCard } from "@/components/card/SectionCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/Loading";
import {
  TableActionsDropdown,
  type ColumnAction,
} from "@/components/table/components/TableActionsDropdown";
import { TableRoot } from "@/components/table/Table";
import { TableContent } from "@/components/table/TableContent";

import {
  useGetMyRaffles,
  useUpdateRaffleStatus,
  type RaffleStatus,
} from "@/features/raffle/api/services/useRaffleService";
import { buildSalesXlsxUrl } from "@/features/raffle/api/services/useRaffleBuyersService";
import { DrawDialog } from "@/features/raffle/components/DrawDialog";
import { ShareRaffleDialog } from "@/features/raffle/components/ShareRaffleDialog";
import type { RaffleApiDto } from "@/features/raffle/api/dtos/raffle";

type RaffleWithStatus = RaffleApiDto & { status?: RaffleStatus };

const ALLOWED_TRANSITIONS: Record<string, RaffleStatus[]> = {
  DRAFT: ["PUBLISHED", "CANCELLED"],
  PUBLISHED: ["OPEN", "CANCELLED"],
  OPEN: ["PAUSED", "SOLD_OUT", "CLOSED", "CANCELLED"],
  PAUSED: ["OPEN", "CLOSED", "CANCELLED"],
  SOLD_OUT: ["CLOSED", "DRAWN"],
  CLOSED: ["DRAWN"],
  DRAWN: [],
  CANCELLED: [],
};

export const RaffleModule = () => {
  const navigate = useNavigate();
  const { data: raffles, isLoading, error } = useGetMyRaffles();
  const { mutateAsync: updateStatus } = useUpdateRaffleStatus();

  const [drawTarget, setDrawTarget] = useState<RaffleWithStatus | null>(null);
  const [shareTarget, setShareTarget] = useState<RaffleWithStatus | null>(null);

  const onAdd = () => navigate("/raffle/form/create");
  const onEdit = (id?: number) => id && navigate(`/raffle/form/edit/${id}`);
  const onView = (id?: number) => id && navigate(`/raffle/form/view/${id}`);
  const onSale = (id?: number) => id && navigate(`/raffle/${id}`);
  const onBuyers = (id?: number) => id && navigate(`/raffle/${id}/buyers`);

  const handleStatus = async (raffle: RaffleWithStatus, target: RaffleStatus) => {
    if (!raffle.id) return;
    await updateStatus({ id: raffle.id, target });
  };

  const columns: ColumnDef<RaffleWithStatus>[] = useMemo(() => {
    const buildActions = (raffle: RaffleWithStatus): ColumnAction[] => {
      const items: ColumnAction[] = [
        {
          label: "Editar",
          onClick: () => onEdit(raffle.id),
          icon: <Pencil className="h-4 w-4" />,
        },
        {
          label: "Visualizar",
          onClick: () => onView(raffle.id),
          icon: <Eye className="h-4 w-4" />,
        },
        {
          label: "Página de venda",
          onClick: () => onSale(raffle.id),
          icon: <ShoppingCart className="h-4 w-4" />,
        },
        {
          label: "Compradores",
          onClick: () => onBuyers(raffle.id),
          icon: <UsersIcon className="h-4 w-4" />,
        },
        {
          label: "Exportar Excel",
          onClick: () => {
            if (raffle.id) {
              window.open(buildSalesXlsxUrl(raffle.id), "_blank", "noreferrer");
            }
          },
          icon: <Download className="h-4 w-4" />,
        },
        {
          label: "Compartilhar acesso",
          onClick: () => setShareTarget(raffle),
          icon: <Share2 className="h-4 w-4" />,
        },
      ];

      const status = (raffle.status ?? "DRAFT") as RaffleStatus;
      const transitions = ALLOWED_TRANSITIONS[status] ?? [];

      transitions.forEach((target) => {
        items.push({
          label: `Mudar para ${RAFFLE_STATUS_LABEL[target]}`,
          onClick: () => handleStatus(raffle, target),
          icon:
            target === "CANCELLED" ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <Flag className="h-4 w-4" />
            ),
        });
      });

      if (["OPEN", "SOLD_OUT", "CLOSED", "PAUSED"].includes(status)) {
        items.push({
          label: "Sortear",
          onClick: () => setDrawTarget(raffle),
          icon: <Trophy className="h-4 w-4" />,
        });
      }

      return items;
    };

    return [
      {
        id: "title",
        accessorKey: "title",
        header: "Título",
        enableSorting: true,
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        size: 130,
        cell: (ctx) => {
          const value = (ctx.getValue<string>() ?? "DRAFT") as string;
          return <RaffleStatusBadge status={value} />;
        },
      },
      {
        id: "quotaPrice",
        accessorKey: "quotaPrice",
        header: "Preço da cota",
        size: 140,
        cell: (ctx) => {
          const v = ctx.getValue<number>();
          return v != null ? `R$ ${(Number(v) / 100).toFixed(2)}` : "-";
        },
      },
      {
        id: "soldPercentage",
        accessorKey: "soldPercentage",
        header: "% vendido",
        size: 120,
        cell: (ctx) => {
          const v = ctx.getValue<number>();
          return v != null ? `${Number(v).toFixed(2)}%` : "-";
        },
      },
      {
        id: "actions",
        header: "",
        size: 56,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <TableActionsDropdown
              row={row}
              columnActions={buildActions(row.original as RaffleWithStatus)}
              subtle
            />
          </div>
        ),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Erro ao carregar ações: {(error as Error).message}
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <PageHeader
        title="Rifas"
        description="Gerencie status, sorteio, compradores e exportações."
        actions={
          <Button onClick={onAdd} className="h-10">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar rifa
          </Button>
        }
      />

      {isLoading ? (
        <Loading />
      ) : !raffles || raffles.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon={ListChecks}
            title="Nenhuma rifa cadastrada"
            description="Crie a primeira rifa para começar."
            action={
              <Button onClick={onAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Criar a primeira
              </Button>
            }
          />
        </SectionCard>
      ) : (
        <SectionCard>
          <TableRoot<RaffleWithStatus>
            data={raffles as RaffleWithStatus[]}
            columns={columns}
            tableId="raffles-table"
            fillContainerWidth
          >
            <TableContent stickyHeader />
          </TableRoot>
        </SectionCard>
      )}

      {shareTarget?.id && (
        <ShareRaffleDialog
          raffleId={shareTarget.id}
          raffleTitle={shareTarget.title}
          open={Boolean(shareTarget)}
          onOpenChange={(o) => {
            if (!o) setShareTarget(null);
          }}
        />
      )}

      {drawTarget?.id && (
        <DrawDialog
          raffleId={drawTarget.id}
          raffleTitle={drawTarget.title}
          open={Boolean(drawTarget)}
          onOpenChange={(o) => {
            if (!o) setDrawTarget(null);
          }}
        />
      )}
    </section>
  );
};
