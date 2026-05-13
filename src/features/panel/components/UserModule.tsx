import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Users as UsersIcon } from "lucide-react";

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
  Pagination,
  TablePagination,
} from "@/components/table/TablePagination";
import { usePagination } from "@/hooks/usePagination";

import { useGetUsers } from "@/features/user/api/services/useUserService";
import type { UserApiDto } from "@/features/user/api/dtos/user";

export const UserModule = () => {
  const navigate = useNavigate();
  const { page, size, onPageChange, onSizeChange } = usePagination({
    initialPage: 0,
    initialSize: 20,
  });

  const { data, isLoading, error } = useGetUsers({ page, size });
  const users = data?.content ?? [];

  const onAddUser = () => navigate("/user/form/create");
  const onEditUser = (userId?: number) =>
    userId && navigate(`/user/form/edit/${userId}`);

  const columns: ColumnDef<UserApiDto>[] = useMemo(() => {
    const actions: ColumnAction[] = [
      {
        label: "Editar",
        onClick: (row) => onEditUser((row.original as UserApiDto).id),
        icon: <Pencil className="h-4 w-4" />,
      },
    ];

    return [
      { id: "name", accessorKey: "name", header: "Nome", enableSorting: true },
      { id: "login", accessorKey: "login", header: "Login", enableSorting: true },
      { id: "cpf", accessorKey: "cpf", header: "CPF", size: 160 },
      { id: "email", accessorKey: "email", header: "Email" },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pagination: Pagination = {
    page: (data?.number ?? 0) + 1,
    size: data?.size ?? size,
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 1,
    first: data?.first ?? true,
    last: data?.last ?? true,
  };

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Erro ao carregar usuários: {(error as Error)?.message ?? "erro"}
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <PageHeader
        title="Usuários"
        description="Lista de usuários cadastrados."
        actions={
          <Button onClick={onAddUser} className="h-10">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar usuário
          </Button>
        }
      />

      {isLoading ? (
        <Loading />
      ) : users.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon={UsersIcon}
            title="Nenhum usuário encontrado"
            description="Adicione o primeiro usuário ao sistema."
            action={
              <Button onClick={onAddUser}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar usuário
              </Button>
            }
          />
        </SectionCard>
      ) : (
        <SectionCard>
          <TableRoot<UserApiDto>
            data={users}
            columns={columns}
            tableId="users-table"
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
        </SectionCard>
      )}
    </section>
  );
};
