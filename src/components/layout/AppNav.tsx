import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { ComponentType } from "react";
import { toast } from "sonner";
import {
  BarChart3,
  BookSearch,
  FileText,
  LogIn,
  LogOut,
  Menu as MenuIcon,
  Settings,
  Share2,
  ShoppingCart,
  BookOpen,
  Users,
  Wallet,
} from "lucide-react";

import { isAdmin, useCurrentUser } from "@/features/auth";
import { Button } from "@/components/button/Button";
import { MyPurchasesDialog } from "@/components/layout/MyPurchasesDialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { mergeClasses } from "@/lib/mergeClasses";

import logo from "@/assets/logo.png";

type NavItem = {
  label: string;
  to?: string;
  onAction?: () => void;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
  adminOnly?: boolean;
};

const handleShare = async () => {
  const shareData = {
    title: "Golden Book",
    text: "Confira as rifas no Golden Book",
    url: window.location.href,
  };
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch {
      // user cancelou ou erro — cai pro fallback
    }
  }
  try {
    await navigator.clipboard.writeText(shareData.url);
    toast.success("Link copiado!");
  } catch {
    toast.error("Não foi possível compartilhar.");
  }
};

const ADMIN_ITEMS: ReadonlyArray<NavItem> = [
  { label: "Dashboard", to: "/panel?tab=dashboard", icon: BarChart3 },
  { label: "Rifas", to: "/panel?tab=raffles", icon: BookOpen },
  { label: "Saldo", to: "/panel?tab=balance", icon: Wallet },
  { label: "Usuários", to: "/panel?tab=users", icon: Users, adminOnly: true },
  { label: "Saques", to: "/panel?tab=withdrawals", icon: Wallet, adminOnly: true },
  { label: "Config.", to: "/panel?tab=settings", icon: Settings, adminOnly: true },
  { label: "Termos", to: "/admin/terms", icon: FileText, adminOnly: true },
];

const buildPublicItems = (openPurchases: () => void): ReadonlyArray<NavItem> => [
  { label: "Catálogo", to: "/raffles", icon: BookSearch },
  { label: "Minhas compras", onAction: openPurchases, icon: ShoppingCart },
  { label: "Compartilhar", onAction: handleShare, icon: Share2 },
];

const isAdminArea = (pathname: string) => {
  return (
    pathname.startsWith("/panel") ||
    pathname.startsWith("/raffle/form") ||
    pathname.startsWith("/user/form") ||
    pathname.startsWith("/admin/") ||
    /^\/raffle\/[^/]+\/buyers/.test(pathname)
  );
};

const isItemActive = (current: string, target: string) => {
  // Para itens com query (?tab=), compara também o tab.
  const [targetPath, targetQuery] = target.split("?");
  if (current.split("?")[0] !== targetPath) return false;
  if (!targetQuery) return true;
  const params = new URLSearchParams(window.location.search);
  const targetParams = new URLSearchParams(targetQuery);
  for (const [k, v] of targetParams) {
    if (params.get(k) !== v) return false;
  }
  return true;
};

type Variant = "admin" | "public" | "hidden";

const useNavVariant = (pathname: string): Variant => {
  if (pathname === "/login" || pathname === "/cadastro") return "hidden";
  if (isAdminArea(pathname)) return "admin";
  return "public";
};

export const AppNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: me } = useCurrentUser();
  const userIsAdmin = isAdmin(me);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [purchasesOpen, setPurchasesOpen] = useState(false);

  const variant = useNavVariant(location.pathname);
  const isLogged = Boolean(me);

  const items = useMemo(() => {
    if (variant === "admin") {
      return ADMIN_ITEMS.filter((i) => !i.adminOnly || userIsAdmin);
    }
    return buildPublicItems(() => setPurchasesOpen(true));
  }, [variant, userIsAdmin]);

  if (variant === "hidden") return null;

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {
      // ignore
    }
    navigate("/login");
  };

  const itemActive = (item: NavItem) =>
    item.to
      ? isItemActive(location.pathname + location.search, item.to)
      : false;

  // Mobile: 3 itens principais + "Mais" sempre (com tema, login, etc).
  const primaryItems = items.slice(0, 3);
  const overflowItems = items.slice(3);
  const userInitial = (me?.name ?? me?.login ?? "?").charAt(0).toUpperCase();

  const renderDesktopItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = itemActive(item);
    const baseCls = mergeClasses(
      "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );
    if (item.to) {
      return (
        <Link key={item.label} to={item.to} className={baseCls}>
          <Icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      );
    }
    return (
      <button
        key={item.label}
        type="button"
        onClick={item.onAction}
        className={baseCls}
      >
        <Icon className="h-4 w-4" />
        <span>{item.label}</span>
      </button>
    );
  };

  const renderMobileItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = itemActive(item);
    const baseCls = mergeClasses(
      "flex h-full w-full flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium transition-colors",
      active ? "text-primary" : "text-muted-foreground",
    );
    if (item.to) {
      return (
        <Link to={item.to} className={baseCls}>
          <Icon className="h-5 w-5" />
          <span className="truncate">{item.label}</span>
        </Link>
      );
    }
    return (
      <button type="button" onClick={item.onAction} className={baseCls}>
        <Icon className="h-5 w-5" />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {/* ===== Desktop top bar ===== */}
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 top-0 z-40 hidden h-16 items-center gap-4 border-b border-border bg-card/95 px-4 backdrop-blur sm:flex"
      >
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Golden Book" className="h-9 w-auto" />
          <span className="text-base font-semibold tracking-tight text-foreground">
            Golden Book
          </span>
        </Link>

        <div className="flex flex-1 items-center gap-1 overflow-x-auto">
          {items.map(renderDesktopItem)}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle iconOnly />
          {isLogged ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sair</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate("/login")}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              <span>Entrar</span>
            </Button>
          )}
        </div>
      </nav>

      {/* ===== Mobile bottom bar ===== */}
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom,0)] sm:hidden"
      >
        <ul className="flex h-16 items-stretch">
          {primaryItems.map((item) => (
            <li key={item.label} className="flex-1">
              {renderMobileItem(item)}
            </li>
          ))}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-label="Mais opções"
              className={mergeClasses(
                "flex h-full w-full flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium transition-colors",
                sheetOpen ? "text-primary" : "text-muted-foreground",
              )}
            >
              <MenuIcon className="h-5 w-5" />
              <span>Mais</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* ===== Drawer mobile ===== */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-card p-0"
        >
          {/* Drag handle (estilo iOS) */}
          <div className="flex justify-center pt-2 pb-1">
            <span className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Header com perfil */}
          <SheetHeader className="border-b border-border px-5 pb-4">
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                {isLogged ? userInitial : "?"}
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="truncate text-base text-foreground">
                  {isLogged ? me?.name ?? "Usuário" : "Visitante"}
                </SheetTitle>
                <SheetDescription className="truncate text-xs">
                  {isLogged ? me?.email ?? "" : "Entre para gerenciar suas rifas."}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Itens extras */}
          {overflowItems.length > 0 && (
            <div className="px-5 py-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {variant === "admin" ? "Painel" : "Navegação"}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {overflowItems.map((item) => {
                  const Icon = item.icon;
                  const active = itemActive(item);
                  const cls = mergeClasses(
                    "flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-card p-3 text-center text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted",
                  );
                  if (item.to) {
                    return (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setSheetOpen(false)}
                        className={cls}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setSheetOpen(false);
                        item.onAction?.();
                      }}
                      className={cls}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preferências */}
          <div className="border-t border-border px-5 py-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Preferências
            </p>
            <ThemeToggle label="Tema" description="Claro ou escuro" />
          </div>

          {/* Conta */}
          <div className="border-t border-border px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Conta
            </p>
            {isLogged ? (
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setSheetOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            ) : (
              <Button
                type="button"
                className="w-full justify-start"
                onClick={() => {
                  setSheetOpen(false);
                  navigate("/login");
                }}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Entrar
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <MyPurchasesDialog open={purchasesOpen} onOpenChange={setPurchasesOpen} />
    </>
  );
};
