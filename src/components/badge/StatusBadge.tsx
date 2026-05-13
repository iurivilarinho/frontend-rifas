import type { ReactNode } from "react";

import { mergeClasses } from "@/lib/mergeClasses";

export type StatusTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "muted"
  | "violet";

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "bg-gray-100 text-gray-700",
  info: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-700",
  muted: "bg-slate-200 text-slate-800",
  violet: "bg-violet-100 text-violet-800",
};

type StatusBadgeProps = {
  children: ReactNode;
  tone?: StatusTone;
  className?: string;
};

export const StatusBadge = ({ children, tone = "neutral", className }: StatusBadgeProps) => (
  <span
    className={mergeClasses(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
      TONE_CLASSES[tone],
      className,
    )}
  >
    {children}
  </span>
);

export const RAFFLE_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicada",
  OPEN: "Aberta",
  PAUSED: "Pausada",
  SOLD_OUT: "Esgotada",
  CLOSED: "Encerrada",
  DRAWN: "Sorteada",
  CANCELLED: "Cancelada",
};

export const RAFFLE_STATUS_TONE: Record<string, StatusTone> = {
  DRAFT: "neutral",
  PUBLISHED: "info",
  OPEN: "success",
  PAUSED: "warning",
  SOLD_OUT: "success",
  CLOSED: "muted",
  DRAWN: "violet",
  CANCELLED: "danger",
};

type RaffleStatusBadgeProps = {
  status: string;
  className?: string;
};

export const RaffleStatusBadge = ({ status, className }: RaffleStatusBadgeProps) => (
  <StatusBadge tone={RAFFLE_STATUS_TONE[status] ?? "neutral"} className={className}>
    {RAFFLE_STATUS_LABEL[status] ?? status}
  </StatusBadge>
);
