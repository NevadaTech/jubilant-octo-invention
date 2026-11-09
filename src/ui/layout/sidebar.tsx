"use client";

import { useState, useMemo } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/ui/lib/utils";
import { usePermissions } from "@/modules/authentication/presentation/hooks/use-permissions";
import { PERMISSIONS } from "@/shared/domain/permissions";
import type { Permission } from "@/shared/domain/permissions";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  RotateCcw,
  FileBarChart,
  Upload,
  Plug,
  Users,
  UserRoundSearch,
  Shield,
  ClipboardList,
  Settings,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  /** Permissions required to see this item. Empty = always visible. */
  requiredPermissions?: Permission[];
  children?: {
    label: string;
    href: string;
    requiredPermissions?: Permission[];
  }[];
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["inventory"]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { hasAnyPermission } = usePermissions();

  const allNavItems: NavItem[] = [
    {
      label: t("navigation.dashboard"),
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: t("navigation.inventory"),
      icon: <Package className="h-5 w-5" />,
      requiredPermissions: [
        PERMISSIONS.PRODUCTS_READ,
        PERMISSIONS.WAREHOUSES_READ,
        PERMISSIONS.INVENTORY_READ,
        PERMISSIONS.INVENTORY_TRANSFER,
        PERMISSIONS.COMBOS_READ,
        PERMISSIONS.BRANDS_READ,
      ],
      children: [
        {
          label: t("navigation.products"),
          href: "/dashboard/inventory/products",
          requiredPermissions: [PERMISSIONS.PRODUCTS_READ],
        },
        {
          label: t("navigation.categories"),
          href: "/dashboard/inventory/categories",
          requiredPermissions: [PERMISSIONS.PRODUCTS_READ],
        },
        {
          label: t("navigation.combos"),
          href: "/dashboard/inventory/combos",
          requiredPermissions: [PERMISSIONS.COMBOS_READ],
        },
        {
          label: t("navigation.brands"),
          href: "/dashboard/inventory/brands",
          requiredPermissions: [PERMISSIONS.BRANDS_READ],
        },
        {
          label: t("navigation.warehouses"),
          href: "/dashboard/inventory/warehouses",
          requiredPermissions: [PERMISSIONS.WAREHOUSES_READ],
        },
        {
          label: t("navigation.movements"),
          href: "/dashboard/inventory/movements",
          requiredPermissions: [PERMISSIONS.INVENTORY_READ],
        },
        {
          label: t("navigation.transfers"),
          href: "/dashboard/inventory/transfers",
          requiredPermissions: [PERMISSIONS.INVENTORY_TRANSFER],
        },
        {
          label: t("navigation.stock"),
          href: "/dashboard/inventory/stock",
          requiredPermissions: [PERMISSIONS.INVENTORY_READ],
        },
      ],
    },
    {
      label: t("navigation.sales"),
      href: "/dashboard/sales",
      icon: <ShoppingCart className="h-5 w-5" />,
      requiredPermissions: [PERMISSIONS.SALES_READ],
    },
    {
      label: t("navigation.returns"),
      href: "/dashboard/returns",
      icon: <RotateCcw className="h-5 w-5" />,
      requiredPermissions: [PERMISSIONS.RETURNS_READ],
    },
    {
      label: t("navigation.contacts"),
      href: "/dashboard/contacts",
      icon: <UserRoundSearch className="h-5 w-5" />,
      requiredPermissions: [PERMISSIONS.CONTACTS_READ],
    },
    {
      label: t("navigation.reports"),
      href: "/dashboard/reports",
      icon: <FileBarChart className="h-5 w-5" />,
      requiredPermissions: [PERMISSIONS.REPORTS_READ],
    },
    {
      label: t("navigation.imports"),
      href: "/dashboard/imports",
      icon: <Upload className="h-5 w-5" />,
      requiredPermissions: [PERMISSIONS.PRODUCTS_IMPORT],
    },
    {
      label: t("navigation.integrations"),
      href: "/dashboard/integrations",
      icon: <Plug className="h-5 w-5" />,
      requiredPermissions: [PERMISSIONS.INTEGRATIONS_READ],
    },
    {
      label: t("navigation.users"),
      href: "/dashboard/users",
      icon: <Users className="h-5 w-5" />,
      requiredPermissions: [PERMISSIONS.USERS_READ],
    },
    {
      label: t("navigation.roles"),
      href: "/dashboard/roles",
      icon: <Shield className="h-5 w-5" />,
      requiredPermissions: [PERMISSIONS.ROLES_READ],
    },
    {
      label: t("navigation.audit"),
      href: "/dashboard/audit",
      icon: <ClipboardList className="h-5 w-5" />,
      requiredPermissions: [PERMISSIONS.AUDIT_READ],
    },
    {
      label: t("navigation.settings"),
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // Filter nav items based on user permissions
  const navItems = useMemo(() => {
    return allNavItems
      .filter((item) => {
        if (!item.requiredPermissions?.length) return true;
        return hasAnyPermission(item.requiredPermissions);
      })
      .map((item) => {
        if (!item.children) return item;
        const filteredChildren = item.children.filter((child) => {
          if (!child.requiredPermissions?.length) return true;
          return hasAnyPermission(child.requiredPermissions);
        });
        if (filteredChildren.length === 0) return null;
        return { ...item, children: filteredChildren };
      })
      .filter(Boolean) as NavItem[];
  }, [allNavItems, hasAnyPermission]);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const renderNavItem = (item: NavItem, _index: number) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const active = item.href ? isActive(item.href) : false;

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpanded(item.label)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex items-center gap-3">
              {item.icon}
              {item.label}
            </span>
            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </button>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                  {item.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      aria-current={isActive(child.href) ? "page" : undefined}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isActive(child.href)
                          ? "bg-primary-100 text-primary-700"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href!}
        onClick={() => setIsMobileOpen(false)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          active
            ? "bg-primary-100 text-primary-700"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {item.icon}
        {item.label}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <Link
          href="/dashboard"
          className="rounded-md text-lg font-bold text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Nevada
        </Link>
      </div>

      {/* Navigation */}
      <nav
        aria-label={t("navigation.sections")}
        className="flex-1 space-y-1 overflow-y-auto p-3"
      >
        {navItems.map((item, index) => renderNavItem(item, index))}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-40 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold shadow-md lg:hidden"
        aria-label={t("navigation.menu")}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
        {t("navigation.menu")}
      </button>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-border bg-card lg:hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label={t("navigation.closeMenu")}
              >
                <X className="h-5 w-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden h-full w-[240px] shrink-0 flex-col border-r border-border bg-card lg:flex",
          className,
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
