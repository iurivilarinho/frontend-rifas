import { useEffect } from "react";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "@/components/button/Button";

export const PwaUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error("[PWA] service worker registration failed", error);
    },
  });

  useEffect(() => {
    if (!needRefresh) return;

    const id = toast("Nova versão disponível", {
      description: "Recarregue para obter as últimas correções.",
      duration: Infinity,
      action: (
        <Button
          type="button"
          size="sm"
          onClick={() => {
            void updateServiceWorker(true);
          }}
        >
          Atualizar
        </Button>
      ),
      onDismiss: () => setNeedRefresh(false),
    });

    return () => {
      toast.dismiss(id);
    };
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  return null;
};
