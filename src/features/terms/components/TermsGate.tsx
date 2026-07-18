import { useState } from "react";

import { Button } from "@/components/button/Button";
import { useCurrentUser } from "@/features/auth/api/services/useCurrentUser";

import { useAcceptTerms, useTermsStatus } from "../api/useTermsService";
import { TermsContent } from "./TermsContent";

/**
 * Barreira dos Termos de Uso: quando o usuário logado tem uma versão vigente ainda não aceita,
 * cobre o app com um modal não-dispensável até aceitar. Montada no root; se não há o que aceitar,
 * não renderiza nada.
 */
export const TermsGate = () => {
  const { data: user } = useCurrentUser();
  const { data: status } = useTermsStatus();
  const accept = useAcceptTerms();
  const [confirmed, setConfirmed] = useState(false);

  if (!user || !status?.requiresAcceptance || !status.current) return null;
  const terms = status.current;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {status.acceptedVersion ? "Atualizamos os Termos de Uso" : "Termos de Uso"}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {status.acceptedVersion
              ? "Para continuar, leia e aceite a nova versão."
              : "Para continuar, leia e aceite os Termos de Uso."}{" "}
            Versão {terms.version}.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <TermsContent content={terms.content} />
        </div>

        <div className="space-y-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
          <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4"
            />
            <span>Li e aceito os Termos de Uso.</span>
          </label>
          <Button
            className="w-full"
            disabled={!confirmed || accept.isPending}
            onClick={() => accept.mutate({ termsVersionId: terms.id })}
          >
            {accept.isPending ? "Registrando..." : "Aceitar e continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
};
