"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/ui/lib/utils";
import { useLogout } from "@/modules/authentication/presentation/hooks/use-logout";
import { usePermissions } from "@/modules/authentication/presentation/hooks/use-permissions";
import { GlobalCompanySelector } from "@/modules/companies/presentation/components";
import { PERMISSIONS } from "@/shared/domain/permissions";
import type { Permission } from "@/shared/domain/permissions";
import {
  ArrowRightLeft,
  Award,
  Boxes,
  ChartColumn,
  Layers,
  LayoutDashboard,
  Menu,
  Package,
  Plug,
  RotateCcw,
  ScrollText,
  Settings,
  Shield,
  ShoppingCart,
  Tag,
  Truck,
  Upload,
  UserCog,
  Users,
  Building2,
  Warehouse,
  X,
} from "lucide-react";

interface NavLink {
  label: string;
  href: string;
  icon: ReactNode;
  requiredPermissions?: Permission[];
}

interface NavGroup {
  label: string;
  items: NavLink[];
}

export function Sidebar({ className }: { className?: string }) {
  const t = useTranslations();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { hasAnyPermission } = usePermissions();
  const { logout, isLoading: isLoggingOut } = useLogout();

  const groups = useMemo<Array<NavLink | NavGroup>>(() => {
    const link = (
      label: string,
      href: string,
      icon: ReactNode,
      requiredPermissions?: Permission[],
    ): NavLink => ({ label, href, icon, requiredPermissions });

    const visible = (item: NavLink) =>
      !item.requiredPermissions?.length ||
      hasAnyPermission(item.requiredPermissions);

    const panel = link(
      t("navigation.dashboard"),
      "/dashboard",
      <LayoutDashboard className="h-4 w-4" />,
    );

    const inventario: NavLink[] = [
      link(
        t("navigation.products"),
        "/dashboard/inventory/products",
        <Package className="h-4 w-4" />,
        [PERMISSIONS.PRODUCTS_READ],
      ),
      link(
        t("navigation.categories"),
        "/dashboard/inventory/categories",
        <Tag className="h-4 w-4" />,
        [PERMISSIONS.PRODUCTS_READ],
      ),
      link(
        t("navigation.combos"),
        "/dashboard/inventory/combos",
        <Boxes className="h-4 w-4" />,
        [PERMISSIONS.COMBOS_READ],
      ),
      link(
        t("navigation.brands"),
        "/dashboard/inventory/brands",
        <Award className="h-4 w-4" />,
        [PERMISSIONS.BRANDS_READ],
      ),
      link(
        t("navigation.companies"),
        "/dashboard/inventory/companies",
        <Building2 className="h-4 w-4" />,
        [PERMISSIONS.COMPANIES_READ],
      ),
      link(
        t("navigation.warehouses"),
        "/dashboard/inventory/warehouses",
        <Warehouse className="h-4 w-4" />,
        [PERMISSIONS.WAREHOUSES_READ],
      ),
      link(
        t("navigation.movements"),
        "/dashboard/inventory/movements",
        <ArrowRightLeft className="h-4 w-4" />,
        [PERMISSIONS.INVENTORY_READ],
      ),
      link(
        t("navigation.transfers"),
        "/dashboard/inventory/transfers",
        <Truck className="h-4 w-4" />,
        [PERMISSIONS.INVENTORY_TRANSFER],
      ),
      link(
        t("navigation.stock"),
        "/dashboard/inventory/stock",
        <Layers className="h-4 w-4" />,
        [PERMISSIONS.INVENTORY_READ],
      ),
    ].filter(visible);

    const comercial: NavLink[] = [
      link(
        t("navigation.sales"),
        "/dashboard/sales",
        <ShoppingCart className="h-4 w-4" />,
        [PERMISSIONS.SALES_READ],
      ),
      link(
        t("navigation.returns"),
        "/dashboard/returns",
        <RotateCcw className="h-4 w-4" />,
        [PERMISSIONS.RETURNS_READ],
      ),
      link(
        t("navigation.contacts"),
        "/dashboard/contacts",
        <Users className="h-4 w-4" />,
        [PERMISSIONS.CONTACTS_READ],
      ),
    ].filter(visible);

    const datos: NavLink[] = [
      link(
        t("navigation.reports"),
        "/dashboard/reports",
        <ChartColumn className="h-4 w-4" />,
        [PERMISSIONS.REPORTS_READ],
      ),
      link(
        t("navigation.imports"),
        "/dashboard/imports",
        <Upload className="h-4 w-4" />,
        [PERMISSIONS.PRODUCTS_IMPORT],
      ),
      link(
        t("navigation.integrations"),
        "/dashboard/integrations",
        <Plug className="h-4 w-4" />,
        [PERMISSIONS.INTEGRATIONS_READ],
      ),
    ].filter(visible);

    const administracion: NavLink[] = [
      link(
        t("navigation.users"),
        "/dashboard/users",
        <UserCog className="h-4 w-4" />,
        [PERMISSIONS.USERS_READ],
      ),
      link(
        t("navigation.roles"),
        "/dashboard/roles",
        <Shield className="h-4 w-4" />,
        [PERMISSIONS.ROLES_READ],
      ),
      link(
        t("navigation.audit"),
        "/dashboard/audit",
        <ScrollText className="h-4 w-4" />,
        [PERMISSIONS.AUDIT_READ],
      ),
      link(
        t("navigation.settings"),
        "/dashboard/settings",
        <Settings className="h-4 w-4" />,
      ),
    ].filter(visible);

    const sections: Array<NavLink | NavGroup> = [panel];
    if (inventario.length) {
      sections.push({ label: t("navigation.inventory"), items: inventario });
    }
    if (comercial.length) {
      sections.push({ label: "Comercial", items: comercial });
    }
    if (datos.length) {
      sections.push({ label: "Datos", items: datos });
    }
    if (administracion.length) {
      sections.push({
        label: "Administración",
        items: administracion,
      });
    }
    return sections;
  }, [hasAnyPermission, t]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const itemClass = (active: boolean) =>
    cn(
      "flex h-[34px] items-center gap-2 rounded-lg px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      active
        ? "bg-primary-100 font-semibold text-primary"
        : "font-normal text-foreground hover:bg-muted",
    );

  const nav = (
    <nav
      aria-label={t("navigation.sections")}
      className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-[18px]"
    >
      <Link
        href="/dashboard"
        className="mb-2 rounded-md px-2.5 text-[22px] font-bold leading-none text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Nevada
      </Link>
      {groups.map((entry) => {
        if ("href" in entry) {
          const active = isActive(entry.href);
          return (
            <Link
              key={entry.href}
              href={entry.href}
              aria-current={active ? "page" : undefined}
              onClick={() => setIsMobileOpen(false)}
              className={itemClass(active)}
            >
              <span
                className={cn(
                  "shrink-0",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {entry.icon}
              </span>
              {entry.label}
            </Link>
          );
        }

        return (
          <div key={entry.label} className="mt-3">
            <p className="px-2.5 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {entry.label}
            </p>
            {entry.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setIsMobileOpen(false)}
                  className={itemClass(active)}
                >
                  <span
                    className={cn(
                      "shrink-0",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("navigation.menu")}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
          {t("navigation.menu")}
        </button>
        <GlobalCompanySelector compact />
      </div>

      <AnimatePresence>
        {isMobileOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/80 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-border bg-card lg:hidden"
            >
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-3 right-3 rounded-lg p-2 text-muted-foreground hover:bg-muted"
                aria-label={t("navigation.closeMenu")}
              >
                <X className="h-5 w-5" />
              </button>
              {nav}
              <div className="border-t border-border p-3">
                <button
                  type="button"
                  className="text-sm font-semibold text-primary"
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                >
                  {t("auth.logout")}
                </button>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <aside
        className={cn(
          "hidden h-full w-[240px] shrink-0 flex-col border-r border-border bg-card lg:flex",
          className,
        )}
      >
        {nav}
      </aside>
    </>
  );
}
