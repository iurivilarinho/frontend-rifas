import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/button/Button";
import { TermsContent, useCurrentTerms } from "@/features/terms";

const formatDate = (value?: string | null): string | null => {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? format(parsed, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : null;
};

export const TermsOfUsePage = () => {
  const navigate = useNavigate();
  const { data: terms, isLoading, isError } = useCurrentTerms();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Button variant="outline" className="mb-6" onClick={() => navigate(-1)}>
        Voltar
      </Button>

      {isLoading ? (
        <p className="text-sm text-slate-400">Carregando...</p>
      ) : isError || !terms ? (
        <p className="text-sm text-slate-500">Não foi possível carregar os termos.</p>
      ) : (
        <>
          <div className="mb-4 border-b border-slate-200 pb-3 text-xs text-slate-500 dark:border-slate-700">
            Versão {terms.version}
            {formatDate(terms.publishedAt) ? ` — publicada em ${formatDate(terms.publishedAt)}` : ""}
          </div>
          <TermsContent content={terms.content} />
        </>
      )}
    </div>
  );
};
