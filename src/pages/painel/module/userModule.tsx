// src/pages/painel/sections/UsuariosSection.tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus } from "lucide-react";

import Loading from "@/components/loading";
import { Button } from "@/components/button/button";
import { TableRoot } from "@/components/table/Table";
import { TableContent } from "@/components/table/TableContent";
import {
  TableActionsDropdown,
  type ColumnAction,
} from "@/components/table/components/TableActionsDropdown";

// ajuste para o hook real do seu projeto (nome/caminho)
import { useGetUser } from "@/lib/api/tanstackQuery/user";

export interface User {
  id: number;
  foto?: File;
  nome: string;
  dataNascimento: string; // YYYY-MM-DD
  cpf: string;
  rg: string;
  genero: string;
  estadoCivil: string;
  telefoneCelular: string;
  telefoneResidencial?: string;
  email: string;
  endereco: unknown;
}

const formatDateBR = (iso?: string) => {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};

const UsuariosSection = () => {
  const navigate = useNavigate();

  const { data: users, isLoading, error } = useGetUser();

  const onAddUser = () => navigate("/pessoa/form/create");
  const onEditUser = (userId?: number) => {
    if (!userId) return;
    navigate(`/pessoa/form/edit/${userId}`);
  };

  const columns: ColumnDef<User, any>[] = useMemo(() => {
    const actions: ColumnAction[] = [
      {
        label: "Editar",
        onClick: (row) => onEditUser((row.original as User).id),
        icon: <Pencil className="h-4 w-4" />,
      },
    ];

    return [
      {
        id: "nome",
        accessorKey: "nome",
        header: "Nome",
        enableSorting: true,
      },
      {
        id: "dataNascimento",
        accessorKey: "dataNascimento",
        header: "Nascimento",
        size: 140,
        enableSorting: true,
        cell: (ctx) => formatDateBR(ctx.getValue<string>()),
      },
      {
        id: "cpf",
        accessorKey: "cpf",
        header: "CPF",
        size: 160,
      },
      {
        id: "rg",
        accessorKey: "rg",
        header: "RG",
        size: 140,
      },
      {
        id: "telefoneCelular",
        accessorKey: "telefoneCelular",
        header: "Celular",
        size: 160,
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

  if (error) {
    return (
      <div>Erro ao carregar usuários: {(error as any)?.message ?? "erro"}</div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Usuários</h1>
          <p className="text-sm text-gray-600">
            Lista de usuários cadastrados.
          </p>
        </div>

        <Button onClick={onAddUser} className="h-10">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar usuário
        </Button>
      </div>

      {isLoading ? (
        <Loading />
      ) : !users || users.length === 0 ? (
        <div className="border rounded-xl p-6 bg-white text-sm text-gray-700">
          Nenhum usuário encontrado
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-white">
          <TableRoot<User>
            data={users}
            columns={columns}
            tableId="usuarios-table"
            fillContainerWidth
          >
            <TableContent stickyHeader />
          </TableRoot>
        </div>
      )}
    </section>
  );
};

export default UsuariosSection;
