import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { setOnSessionExpired } from "@/api/clients/apiClient";

const PUBLIC_PREFIXES = [
  "/login",
  "/cadastro",
  "/raffles",
  "/raffle/", // /raffle/{id} (visão pública) — só protegidas têm guard direto
  "/privacy",
  "/terms",
];

const isPublicPath = (pathname: string) => {
  if (pathname === "/") return true;
  if (pathname === "/login") return true;
  // /raffle/.../buyers e /raffle/form/... são protegidas, mas o
  // ProtectedRoute trata isso; aqui basta evitar redirecionar ao /login
  // estando em telas públicas que normalmente não exigem auth.
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/") || pathname === p.replace(/\/$/, ""),
  );
};

export const SessionGate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    setOnSessionExpired(() => {
      try {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } catch {
        // ignore
      }
      queryClient.removeQueries({ queryKey: ["current-user"] });

      // Não redireciona se já está em página pública.
      if (isPublicPath(location.pathname)) return;

      const redirectTo = location.pathname + location.search + location.hash;
      navigate(`/login?redirect=${encodeURIComponent(redirectTo)}`, {
        replace: true,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search, location.hash]);

  return null;
};
