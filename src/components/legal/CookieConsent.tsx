import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/button/Button";

const STORAGE_KEY = "cookie-consent-v1";

type ConsentValue = "accepted" | "essential-only";

export const CookieConsent = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  const persist = (value: ConsentValue) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // localStorage indisponível (Safari modo privado / cookies bloqueados)
    }
    setOpen(false);
  };

  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:p-6"
    >
      <p className="text-sm text-slate-700 dark:text-slate-200">
        Utilizamos cookies estritamente necessários para autenticação, segurança e
        funcionamento do PWA. Não utilizamos rastreamento publicitário. Veja nossa{" "}
        <Link to="/privacy" className="underline">
          Política de Privacidade
        </Link>{" "}
        e nossos{" "}
        <Link to="/terms" className="underline">
          Termos de Uso
        </Link>
        .
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" size="sm" onClick={() => persist("essential-only")}>
          Apenas essenciais
        </Button>
        <Button size="sm" onClick={() => persist("accepted")}>
          Aceitar
        </Button>
      </div>
    </div>
  );
};

export const getStoredCookieConsent = (): ConsentValue | null => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "accepted" || v === "essential-only" ? v : null;
  } catch {
    return null;
  }
};
