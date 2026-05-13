import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/button/Button";
import { cn } from "@/lib/mergeClasses";
import { usePushSubscription } from "../hooks/usePushSubscription";
import type { PushTopic } from "../api/dtos/push";

type PushNotificationsToggleProps = {
  topic: PushTopic;
  customerId?: number;
  className?: string;
};

export const PushNotificationsToggle = ({
  topic,
  customerId,
  className,
}: PushNotificationsToggleProps) => {
  const { supported, permission, isSubscribed, isWorking, enable, disable } =
    usePushSubscription({ topic, customerId });
  const [isBusy, setIsBusy] = useState(false);

  if (!supported) {
    return null;
  }

  const isDenied = permission === "denied";

  const handleClick = async () => {
    if (isBusy || isWorking) return;
    setIsBusy(true);
    try {
      if (isSubscribed) {
        await disable();
        toast.success("Notificações desativadas neste dispositivo.");
        return;
      }
      const result = await enable();
      if (result.ok) {
        toast.success("Notificações ativadas neste dispositivo.");
        return;
      }
      const reason = result.reason ?? "unknown";
      if (reason === "denied") {
        toast.error("Permissão de notificação negada. Habilite nas configurações do navegador.");
      } else if (reason === "missing-server-key") {
        toast.error("Servidor sem chave VAPID configurada.");
      } else if (reason === "unsupported") {
        toast.error("Este dispositivo não suporta notificações push.");
      } else {
        toast.error(`Falha ao ativar notificações (${reason}).`);
      }
    } finally {
      setIsBusy(false);
    }
  };

  const Icon = isSubscribed ? Bell : BellOff;
  const label = isSubscribed ? "Notificações ativas" : "Ativar notificações";

  return (
    <Button
      type="button"
      variant={isSubscribed ? "default" : "outline"}
      onClick={handleClick}
      disabled={isBusy || isWorking || isDenied}
      className={cn("h-10 gap-2", className)}
      title={isDenied ? "Permissão bloqueada nas configurações do navegador" : label}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
};
