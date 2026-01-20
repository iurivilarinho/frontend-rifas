import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/button/button";
import Loading from "@/components/loading";
import { TableRoot } from "@/components/table/Table";
import { TableContent } from "@/components/table/TableContent";
import {
  TableActionsDropdown,
  type ColumnAction,
} from "@/components/table/components/TableActionsDropdown";

// ajuste para o hook real do seu projeto (nome/caminho)
import {
  Pagination,
  TablePagination,
} from "@/components/table/TablePagination";
import { useGetUser } from "@/lib/api/tanstackQuery/user";
import { PageResponse } from "@/types/PageReseponse";
import { User } from "@/types/user";

const UsuariosSection = () => {
  const navigate = useNavigate();

  // Spring Page é 0-based (number: 0 é a primeira)
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Ideal: seu hook aceitar { page, size } e retornar PageResponse<UserApi>
  const { data, isLoading, error } = useGetUser({
    page: pageIndex,
    size: pageSize,
  }) as {
    data?: PageResponse<User>;
    isLoading: boolean;
    error: unknown;
  };

  const users = data?.content ?? [];

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
        id: "name",
        accessorKey: "name",
        header: "Nome",
        enableSorting: true,
      },
      {
        id: "login",
        accessorKey: "login",
        header: "Login",
        enableSorting: true,
      },
      {
        id: "cpf",
        accessorKey: "cpf",
        header: "CPF",
        size: 160,
      },
      {
        id: "email",
        accessorKey: "email",
        header: "Email",
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Ativo",
        size: 110,
        cell: (ctx) => (ctx.getValue<boolean>() ? "Sim" : "Não"),
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

  const pagination: Pagination = {
    // TablePagination é 1-based
    page: (data?.number ?? 0) + 1,
    size: data?.size ?? pageSize,
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 1,
    first: data?.first ?? true,
    last: data?.last ?? true,
  };

  const onPageChange = (page1Based: number) => {
    // backend (Spring) é 0-based
    setPageIndex(Math.max(0, page1Based - 1));
  };

  const onPageSizeChange = (size: number) => {
    setPageSize(size);
    setPageIndex(0); // volta pra primeira página ao trocar tamanho
  };

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
      ) : users.length === 0 ? (
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

          <TablePagination
            pagination={pagination}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            isSticky
          />
        </div>
      )}
    </section>
  );
};

export default UsuariosSection;
