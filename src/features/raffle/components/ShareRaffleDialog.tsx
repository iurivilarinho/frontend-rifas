import { useState } from "react";
import { Loader2, Share2, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { StatusBadge, type StatusTone } from "@/components/badge/StatusBadge";
import { Button } from "@/components/button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog/Dialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Field, FieldError, FieldLabel } from "@/components/input/base/Field";
import { Input } from "@/components/input/base/Input";

import type {
  CollaboratorRole,
  RaffleCollaboratorApiDto,
} from "../api/dtos/collaborator";
import {
  useAddRaffleCollaborator,
  useGetRaffleCollaborators,
  useRemoveRaffleCollaborator,
} from "../api/services/useRaffleCollaboratorService";

const addCollaboratorSchema = z.object({
  email: z.email("E-mail inválido."),
  role: z.enum(["EDITOR", "VIEWER"]),
});

type AddCollaboratorFormValues = z.infer<typeof addCollaboratorSchema>;

const DEFAULT_FORM: AddCollaboratorFormValues = { email: "", role: "EDITOR" };

const ROLE_LABEL: Record<CollaboratorRole, string> = {
  EDITOR: "Editor",
  VIEWER: "Visualizador",
};
const ROLE_TONE: Record<CollaboratorRole, StatusTone> = {
  EDITOR: "info",
  VIEWER: "muted",
};

type ShareRaffleDialogProps = {
  raffleId: number;
  raffleTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const extractApiMessage = (error: unknown): string => {
  type AxiosLikeError = {
    response?: { data?: { message?: string | string[] } };
    message?: string;
  };
  const err = error as AxiosLikeError;
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(" · ") || "Erro ao processar a requisição.";
  if (typeof msg === "string" && msg) return msg;
  return err?.message ?? "Erro ao processar a requisição.";
};

export const ShareRaffleDialog = ({
  raffleId,
  raffleTitle,
  open,
  onOpenChange,
}: ShareRaffleDialogProps) => {
  const {
    data: collaborators,
    isLoading,
    error,
  } = useGetRaffleCollaborators(raffleId, { enabled: open });
  const { mutateAsync: addCollaborator, isPending: isAdding } =
    useAddRaffleCollaborator(raffleId);
  const { mutateAsync: removeCollaborator } = useRemoveRaffleCollaborator(raffleId);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddCollaboratorFormValues>({
    resolver: zodResolver(addCollaboratorSchema),
    defaultValues: DEFAULT_FORM,
  });

  const onSubmit = async (values: AddCollaboratorFormValues) => {
    try {
      const saved = await addCollaborator({
        email: values.email.trim().toLowerCase(),
        role: values.role,
      });
      toast.success(`${saved.userName} agora tem acesso à rifa.`);
      reset(DEFAULT_FORM);
    } catch (e) {
      toast.error(extractApiMessage(e));
    }
  };

  const handleRemove = async (item: RaffleCollaboratorApiDto) => {
    const ok = window.confirm(
      `Remover o acesso de ${item.userName} (${item.userEmail})?`,
    );
    if (!ok) return;
    setRemovingId(item.userId);
    try {
      await removeCollaborator(item.userId);
      toast.success("Acesso removido.");
    } catch (e) {
      toast.error(extractApiMessage(e));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset(DEFAULT_FORM);
        onOpenChange(next);
      }}
    >
      <DialogContent className="w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="inline-flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            Compartilhar acesso
          </DialogTitle>
          <DialogDescription>
            {raffleTitle
              ? `Quem pode gerenciar "${raffleTitle}"?`
              : "Quem pode gerenciar esta rifa?"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr,160px]">
            <Field>
              <FieldLabel htmlFor="collab-email">E-mail do usuário</FieldLabel>
              <Input
                id="collab-email"
                type="email"
                autoComplete="email"
                placeholder="fulano@email.com"
                {...register("email")}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="collab-role">Acesso</FieldLabel>
              <select
                id="collab-role"
                {...register("role")}
                className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground"
              >
                <option value="EDITOR">Editor</option>
                <option value="VIEWER">Visualizador</option>
              </select>
            </Field>
          </div>
          <Button type="submit" className="w-full sm:w-auto" disabled={isAdding}>
            {isAdding ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            Adicionar acesso
          </Button>
        </form>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pessoas com acesso
          </p>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">
              {extractApiMessage(error)}
            </p>
          ) : !collaborators || collaborators.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="Nenhum colaborador ainda"
              description="Apenas você (proprietário) tem acesso a esta rifa."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {collaborators.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {c.userName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.userEmail}
                    </p>
                  </div>
                  <StatusBadge tone={ROLE_TONE[c.role]}>{ROLE_LABEL[c.role]}</StatusBadge>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(c)}
                    disabled={removingId === c.userId}
                    aria-label={`Remover acesso de ${c.userName}`}
                    title="Remover acesso"
                  >
                    {removingId === c.userId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
