import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { BarChart3, Settings, Ticket, Users, Wallet } from "lucide-react";

import { isAdmin, useCurrentUser } from "@/features/auth";
import { FilterPills, type FilterPillOption } from "@/components/filter/FilterPills";
import { PageShell } from "@/components/layout/PageShell";
import { PushNotificationsToggle } from "@/features/push";
import {
  AdminWithdrawalsModule,
  MyWithdrawalsModule,
  PlatformSettingsModule,
} from "@/features/withdrawal";

import { DashboardModule } from "../components/DashboardModule";
import { RaffleModule } from "../components/RaffleModule";
import { UserModule } from "../components/UserModule";

type PanelTab =
  | "dashboard"
  | "raffles"
  | "users"
  | "balance"
  | "withdrawals"
  | "settings";

const COMMON_TABS: ReadonlyArray<FilterPillOption<PanelTab>> = [
  { value: "dashboard", label: "Dashboard", icon: BarChart3 },
  { value: "raffles", label: "Rifas", icon: Ticket },
  { value: "balance", label: "Saldo", icon: Wallet },
];

const ADMIN_TABS: ReadonlyArray<FilterPillOption<PanelTab>> = [
  { value: "users", label: "Usuários", icon: Users },
  { value: "withdrawals", label: "Saques", icon: Wallet },
  { value: "settings", label: "Configurações", icon: Settings },
];

const ADMIN_ONLY: ReadonlyArray<PanelTab> = ["users", "withdrawals", "settings"];

export const PanelPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestedTab = (params.get("tab") ?? "dashboard") as PanelTab;

  const { data: me } = useCurrentUser();
  const userIsAdmin = isAdmin(me);

  const tabs = useMemo<ReadonlyArray<FilterPillOption<PanelTab>>>(
    () => (userIsAdmin ? [...COMMON_TABS, ...ADMIN_TABS] : COMMON_TABS),
    [userIsAdmin],
  );

  const tab: PanelTab =
    !userIsAdmin && ADMIN_ONLY.includes(requestedTab) ? "dashboard" : requestedTab;

  return (
    <PageShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterPills
          options={tabs}
          value={tab}
          onChange={(next) => navigate(`/panel?tab=${next}`)}
        />
        <PushNotificationsToggle topic="raffle-admin" />
      </div>

      {tab === "dashboard" && <DashboardModule />}
      {tab === "raffles" && <RaffleModule />}
      {tab === "balance" && <MyWithdrawalsModule />}
      {tab === "users" && userIsAdmin && <UserModule />}
      {tab === "withdrawals" && userIsAdmin && <AdminWithdrawalsModule />}
      {tab === "settings" && userIsAdmin && <PlatformSettingsModule />}
    </PageShell>
  );
};
