// src/pages/painel/sections/ActionsSection.tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Eye, ShoppingCart } from "lucide-react";

import Loading from "@/components/Loading";
import { Button } from "@/components/button/button";
import { TableRoot } from "@/components/table/Table";
import { TableContent } from "@/components/table/TableContent";
import {
  TableActionsDropdown,
  type ColumnAction,
} from "@/components/table/components/TableActionsDropdown";

import { useGetRifa as useGetAction } from "@/lib/api/tanstackQuery/rifa";
import { Action } from "@/types/Action";

const ActionModule = () => {
  const navigate = useNavigate();

  const {
    data: raffles,
    isLoading: isLoadingActions,
    error: errorActions,
  } = useGetAction();

  const onAddAction = () => navigate("/raffle/form/create");
  const onEditAction = (raffleId?: number) => {
    if (!raffleId) return;
    navigate(`/raffle/form/edit/${raffleId}`);
  };

  const onViewAction = (raffleId?: number) => {
    if (!raffleId) return;
    navigate(`/raffle/form/view/${raffleId}`);
  };

  const onSaleAction = (raffleId?: number) => {
    if (!raffleId) return;
    navigate(`/raffle/${raffleId}`);
  };

  const columns: ColumnDef<Action, any>[] = useMemo(() => {
    const actions: ColumnAction[] = [
      {
        label: "Editar",
        onClick: (row) => onEditAction((row.original as Action).id),
        icon: <Pencil className="h-4 w-4" />,
      },
      {
        label: "Visualizar",
        onClick: (row) => onViewAction((row.original as Action).id),
        icon: <Eye className="h-4 w-4" />,
      },

      {
        label: "Venda",
        onClick: (row) => onSaleAction((row.original as Action).id),
        icon: <ShoppingCart className="h-4 w-4" />,
      },
    ];

    return [
      {
        id: "title",
        accessorKey: "title",
        header: "Título",
        enableSorting: true,
      },
      {
        id: "quotaPrice",
        accessorKey: "quotaPrice",
        header: "Preço da cota",
        size: 140,
        cell: (ctx) => {
          const v = ctx.getValue<number>();
          return v != null ? `R$ ${Number(v).toFixed(2)}` : "-";
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
            <TableActionsDropdown row={row} columnActions={actions} subtle />
          </div>
        ),
      },
    ];
  }, []);

  if (errorActions) {
    return <div>Erro ao carregar ações: {errorActions.message}</div>;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Ações</h1>
          <p className="text-sm text-gray-600">
            Lista de ações cadastradas e ações rápidas.
          </p>
        </div>

        <Button onClick={onAddAction} className="h-10">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar ação
        </Button>
      </div>

      {isLoadingActions ? (
        <Loading />
      ) : !raffles || raffles.length === 0 ? (
        <div className="border rounded-xl p-6 bg-white text-sm text-gray-700">
          Nenhuma raffle encontrada
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-white">
          <TableRoot<Action>
            data={raffles}
            columns={columns}
            tableId="raffles-table"
            fillContainerWidth
          >
            <TableContent stickyHeader />
          </TableRoot>
        </div>
      )}
    </section>
  );
};

export default ActionModule;
