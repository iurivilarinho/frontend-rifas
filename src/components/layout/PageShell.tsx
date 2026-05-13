import type { ReactNode } from "react";

import { mergeClasses } from "@/lib/mergeClasses";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  /** Largura máxima do conteúdo central. Default: max-w-6xl. */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
  /**
   * @deprecated A reserva de espaço da AppNav é feita no App.tsx.
   * Mantido para compatibilidade com callsites antigos — ignorado.
   */
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

export const PageShell = ({ children, className, maxWidth = "6xl" }: PageShellProps) => {
  return (
    <div className={mergeClasses("bg-background text-foreground", className)}>
      <div
        className={mergeClasses(
          "mx-auto w-full px-4 py-6 sm:px-6 sm:py-8",
          maxWidthMap[maxWidth],
        )}
      >
        {children}
      </div>
    </div>
  );
};
