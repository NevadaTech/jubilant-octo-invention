"use client";

import { useEffect, useId, useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  Package,
  Plug,
  RotateCcw,
  Settings,
  Shield,
  ShoppingCart,
  Upload,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/ui/lib/utils";
import {
  isPreviewNavActive,
  previewIndexPath,
  previewNav,
} from "../navigation";
import { previewFocusClassName } from "./typography";

const previewIcons = {
  panel: LayoutDashboard,
  inventario: Package,
  ventas: ShoppingCart,
  devoluciones: RotateCcw,
  contactos: Users,
  reportes: FileBarChart,
  importaciones: Upload,
  integraciones: Plug,
  usuarios: UserRound,
  roles: Shield,
  auditoria: ClipboardList,
  configuracion: Settings,
} as const satisfies Record<string, LucideIcon>;

function itemClass(active: boolean) {
  return cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold",
    previewFocusClassName,
    active
      ? "bg-primary-100 text-primary-700"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );
}

export function PreviewSidebar() {
  const pathname = usePathname();
  const listId = useId();
  const [inventoryOpen, setInventoryOpen] = useState(true);
  const inventoryActive = previewNav.some(
    (item) =>
      item.type === "group" &&
      item.children.some((child) => isPreviewNavActive(pathname, child.href)),
  );

  useEffect(() => {
    if (inventoryActive) setInventoryOpen(true);
  }, [inventoryActive]);

  return (
    <aside
      data-slot="preview-sidebar"
      className="fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-border bg-card"
    >
      <div className="flex h-16 items-center border-b border-border px-4">
        <Link
          href={previewIndexPath}
          className={cn(
            "rounded-md text-lg font-bold text-primary-600",
            previewFocusClassName,
          )}
        >
          Nevada
        </Link>
      </div>
      <nav
        aria-label="Secciones"
        className="flex-1 space-y-1 overflow-y-auto p-3"
      >
        {previewNav.map((item) => {
          if (item.type === "group") {
            const Icon = previewIcons[item.icon];
            return (
              <div key={item.label}>
                <button
                  type="button"
                  className={cn(itemClass(false), "w-full justify-between")}
                  aria-expanded={inventoryOpen}
                  aria-controls={listId}
                  onClick={() => setInventoryOpen((open) => !open)}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {item.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform",
                      inventoryOpen && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>
                {inventoryOpen ? (
                  <ul
                    id={listId}
                    className="mt-1 ml-4 space-y-1 border-l border-border pl-3"
                  >
                    {item.children.map((child) => {
                      const active = isPreviewNavActive(pathname, child.href);
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            aria-current={active ? "page" : undefined}
                            className={cn(itemClass(active), "w-full")}
                          >
                            {child.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            );
          }

          const Icon = previewIcons[item.icon];
          const active = isPreviewNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={itemClass(active)}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
