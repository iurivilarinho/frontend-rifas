import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { isAdmin, useCurrentUser } from "@/features/auth";
import { Loading } from "@/components/Loading";

type ProtectedRouteProps = {
  children: ReactNode;
  /** Se true, exige ROLE_ADMIN. */
  requireAdmin?: boolean;
};

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { data: me, isLoading, isError } = useCurrentUser();

  if (isLoading) return <Loading />;

  if (isError || !me) {
    // Salva a URL desejada pra voltar após o login.
    const redirectTo =
      location.pathname + location.search + location.hash || "/panel";
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
        replace
      />
    );
  }

  if (requireAdmin && !isAdmin(me)) {
    return <Navigate to="/panel?tab=dashboard" replace />;
  }

  return <>{children}</>;
};
