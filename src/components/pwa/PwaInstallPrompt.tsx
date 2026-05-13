import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/button/Button";
import { cn } from "@/lib/mergeClasses";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const STORAGE_KEY = "goldenbook.pwaInstallDismissedAt";
const COOLDOWN_DAYS = 14;

export const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(STORAGE_KEY));
    if (
      Number.isFinite(dismissedAt) &&
      dismissedAt > 0 &&
      Date.now() - dismissedAt < COOLDOWN_DAYS * 24 * 60 * 60 * 1000
    ) {
      return;
    }

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
      localStorage.removeItem(STORAGE_KEY);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setVisible(false);
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "dismissed") {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  };

  if (!visible || !deferredPrompt) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-50 px-3 sm:left-auto sm:right-4 sm:w-[22rem]",
        "bottom-[calc(env(safe-area-inset-bottom,0)+5rem)] sm:bottom-4",
      )}
      role="dialog"
      aria-label="Instalar aplicativo"
    >
      <div className="flex items-start gap-3 rounded-xl border bg-white p-3 shadow-lg">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900">Instalar Golden Book</p>
          <p className="mt-0.5 text-xs text-gray-600">
            Acesso mais rápido, modo offline e ícone na tela inicial.
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              className="h-8 px-3"
              onClick={() => void handleInstall()}
            >
              Instalar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 px-3"
              onClick={handleDismiss}
            >
              Agora não
            </Button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Fechar"
          onClick={handleDismiss}
          className="rounded-md p-1 text-gray-500 hover:text-gray-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
