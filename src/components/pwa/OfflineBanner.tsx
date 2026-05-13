import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-green-600 px-3 py-2 text-xs font-semibold text-white shadow-md"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0) + 0.5rem)" }}
    >
      <WifiOff className="h-3.5 w-3.5" aria-hidden />
      Sem conexão — exibindo dados em cache. Vamos sincronizar quando a internet voltar.
    </div>
  );
};
