import { useSearchParams } from "react-router-dom";

import { isAdmin, useCurrentUser } from "@/features/auth";
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

const ADMIN_ONLY: ReadonlyArray<PanelTab> = ["users", "withdrawals", "settings"];

export const PanelPage = () => {
  const [params] = useSearchParams();
  const requestedTab = (params.get("tab") ?? "dashboard") as PanelTab;

  const { data: me } = useCurrentUser();
  const userIsAdmin = isAdmin(me);

  const tab: PanelTab =
    !userIsAdmin && ADMIN_ONLY.includes(requestedTab) ? "dashboard" : requestedTab;

  return (
    <PageShell>
      <div className="mb-4 flex justify-end">
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
