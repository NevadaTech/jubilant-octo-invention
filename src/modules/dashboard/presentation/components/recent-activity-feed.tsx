"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  ShoppingCart,
  ArrowRightLeft,
  RotateCcw,
  PackageCheck,
} from "lucide-react";
import { Badge } from "@/ui/components/badge";

interface ActivityItem {
  type: string;
  reference: string;
  status: string;
  description: string;
  createdAt: string;
}

interface RecentActivityFeedProps {
  data: ActivityItem[];
  lowStockCount?: number;
  combosOutOfStock?: number;
}

const typeIcons: Record<string, typeof ShoppingCart> = {
  SALE: ShoppingCart,
  MOVEMENT: PackageCheck,
  RETURN: RotateCcw,
  TRANSFER: ArrowRightLeft,
};

const listPath: Record<string, string> = {
  SALE: "/dashboard/sales",
  MOVEMENT: "/dashboard/inventory/movements",
  TRANSFER: "/dashboard/inventory/transfers",
  RETURN: "/dashboard/returns",
};

const statusVariant: Record<
  string,
  "default" | "success" | "warning" | "destructive" | "secondary" | "outline"
> = {
  DRAFT: "secondary",
  CONFIRMED: "default",
  COMPLETED: "success",
  SHIPPED: "default",
  PICKING: "warning",
  POSTED: "success",
  VOID: "destructive",
  IN_TRANSIT: "warning",
  RECEIVED: "success",
  CANCELLED: "destructive",
};

function withLocale(path: string): string {
  if (typeof window === "undefined") return path;
  const segment = window.location.pathname.split("/").filter(Boolean)[0];
  if (segment === "en" || segment === "es") return `/${segment}${path}`;
  return `/es${path}`;
}

function QueueRow({
  title,
  meta,
  badge,
  icon,
  href,
}: {
  title: string;
  meta?: ReactNode;
  badge: ReactNode;
  icon?: ReactNode;
  href?: string;
}) {
  const body = (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
      <p className="truncate text-[15px] font-semibold leading-snug text-foreground lg:text-sm">
        {icon}
        {title}
      </p>
      <div className="row-span-1 justify-self-end lg:row-span-2">{badge}</div>
      {meta ? (
        <p className="col-span-2 text-[13px] text-muted-foreground lg:col-span-1">
          {meta}
        </p>
      ) : null}
    </div>
  );

  return (
    <li className="border-border max-lg:rounded-lg max-lg:border max-lg:bg-card lg:border-b lg:last:border-b-0">
      {href ? (
        <a
          href={href}
          className="block hover:bg-muted/40 max-lg:p-3.5 lg:px-6 lg:py-3"
        >
          {body}
        </a>
      ) : (
        <div className="max-lg:p-3.5 lg:px-6 lg:py-3">{body}</div>
      )}
    </li>
  );
}

export function RecentActivityFeed({
  data,
  lowStockCount = 0,
  combosOutOfStock = 0,
}: RecentActivityFeedProps) {
  const t = useTranslations("dashboard.charts");
  const tAttention = useTranslations("dashboard.attention");
  const tStatus = useTranslations("dashboard.charts.recentActivity.status");

  const statusLabel = (status: string) =>
    typeof tStatus.has === "function" && tStatus.has(status)
      ? tStatus(status)
      : status;

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("recentActivity.justNow");
    if (diffMins < 60)
      return t("recentActivity.minutesAgo", { count: diffMins });
    if (diffHours < 24)
      return t("recentActivity.hoursAgo", { count: diffHours });
    return t("recentActivity.daysAgo", { count: diffDays });
  };

  const hasAlerts = lowStockCount > 0 || combosOutOfStock > 0;
  const isEmpty = data.length === 0 && !hasAlerts;

  return (
    <section className="lg:flex lg:h-full lg:flex-col lg:rounded-lg lg:border lg:border-border lg:bg-card">
      <header className="mb-3 flex items-center justify-between gap-3 lg:mb-0 lg:border-b lg:border-border lg:px-6 lg:py-3.5">
        <h2 className="text-base font-semibold text-foreground">
          {t("recentActivity.title")}
        </h2>
        <a
          href={withLocale("/dashboard/inventory/stock")}
          className="inline-flex shrink-0 items-center rounded-lg bg-primary px-3 py-2 text-[13px] font-semibold text-primary-foreground"
        >
          {tAttention("viewStock")}
        </a>
      </header>
      <p className="sr-only">{t("recentActivity.description")}</p>
      {isEmpty ? (
        <p className="py-8 text-sm text-muted-foreground lg:px-6">
          {t("noData")}
        </p>
      ) : (
        <ul className="space-y-3 lg:space-y-0">
          {lowStockCount > 0 ? (
            <QueueRow
              title={tAttention("lowStockTitle")}
              meta={tAttention("lowStockMeta", { count: lowStockCount })}
              href={withLocale("/dashboard/inventory/stock")}
              badge={
                <span className="inline-flex shrink-0 items-center rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
                  {tAttention("lowStockStatus")}
                </span>
              }
            />
          ) : null}
          {combosOutOfStock > 0 ? (
            <QueueRow
              title={tAttention("combosTitle")}
              meta={tAttention("combosMeta", { count: combosOutOfStock })}
              href={withLocale("/dashboard/inventory/combos")}
              badge={
                <span className="inline-flex shrink-0 items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                  {tAttention("combosStatus")}
                </span>
              }
            />
          ) : null}
          {data.map((item, idx) => {
            const Icon = typeIcons[item.type] || PackageCheck;
            const title = item.reference?.trim()
              ? item.reference
              : item.description;
            const detail =
              item.description && item.description !== title
                ? item.description
                : null;
            return (
              <QueueRow
                key={`${item.type}-${item.reference}-${item.createdAt}-${idx}`}
                title={title}
                meta={
                  <>
                    {detail ? (
                      <>
                        <span>{detail}</span>
                        <span aria-hidden="true"> · </span>
                      </>
                    ) : null}
                    <span>{formatRelativeTime(item.createdAt)}</span>
                  </>
                }
                href={
                  listPath[item.type]
                    ? withLocale(listPath[item.type])
                    : undefined
                }
                icon={<Icon className="sr-only" />}
                badge={
                  <Badge
                    variant={statusVariant[item.status] || "outline"}
                    className="shrink-0 px-2 py-0.5 text-xs font-semibold"
                  >
                    {statusLabel(item.status)}
                  </Badge>
                }
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}
