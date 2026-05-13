import type { ReactNode } from "react";

import { mergeClasses } from "@/lib/mergeClasses";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  /** Largura máxima do conteúdo central. Default: max-w-6xl. */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
  /** Reserva espaço pra navbar fixa do painel (h-16). Default: true. */
  withTopNav?: boolean;
};

const maxWidthMap = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
} as const;

export const PageShell = ({
  children,
  className,
  maxWidth = "6xl",
  withTopNav = true,
}: PageShellProps) => {
  return (
    <div
      className={mergeClasses(
        "min-h-screen min-h-[100dvh] bg-background text-foreground",
        withTopNav && "pt-16",
        className,
      )}
    >
      <div
        className={mergeClasses(
          "mx-auto w-full px-4 py-8 pb-[var(--portal-bottom-spacing,5rem)] sm:px-6",
          maxWidthMap[maxWidth],
        )}
      >
        {children}
      </div>
    </div>
  );
};
