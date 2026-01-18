// src/pages/painel/sections/RifasSection.tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil } from "lucide-react";

import Loading from "@/components/loading";
import { Button } from "@/components/button/button";
import { TableRoot } from "@/components/table/Table";
import { TableContent } from "@/components/table/TableContent";
import {
  TableActionsDropdown,
  type ColumnAction,
} from "@/components/table/components/TableActionsDropdown";

import { useGetRifa } from "@/lib/api/tanstackQuery/rifa";
import type { Rifa } from "@/types/rifa";

const RifasSection = () => {
  const navigate = useNavigate();

  const {
    data: rifas,
    isLoading: isLoadingRifas,
    error: errorRifas,
  } = useGetRifa();

  const onAddRifa = () => navigate("/rifa/form/create");
  const onEditRifa = (rifaId?: number) => {
    if (!rifaId) return;
    navigate(`/rifa/form/edit/${rifaId}`);
  };

  const columns: ColumnDef<Rifa, any>[] = useMemo(() => {
    const actions: ColumnAction[] = [
      {
        label: "Editar",
        onClick: (row) => onEditRifa((row.original as Rifa).id),
        icon: <Pencil className="h-4 w-4" />,
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

  if (errorRifas) {
    return <div>Erro ao carregar rifas: {errorRifas.message}</div>;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Rifas</h1>
          <p className="text-sm text-gray-600">
            Lista de rifas cadastradas e ações rápidas.
          </p>
        </div>

        <Button onClick={onAddRifa} className="h-10">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar rifa
        </Button>
      </div>

      {isLoadingRifas ? (
        <Loading />
      ) : !rifas || rifas.length === 0 ? (
        <div className="border rounded-xl p-6 bg-white text-sm text-gray-700">
          Nenhuma rifa encontrada
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-white">
          <TableRoot<Rifa>
            data={rifas}
            columns={columns}
            tableId="rifas-table"
            fillContainerWidth
          >
            <TableContent stickyHeader />
          </TableRoot>
        </div>
      )}
    </section>
  );
};

export default RifasSection;
