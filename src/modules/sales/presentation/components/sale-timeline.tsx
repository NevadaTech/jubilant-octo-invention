"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatDateTimeMedium } from "@/lib/date";
import type { SaleStatus } from "@/modules/sales/domain/entities/sale.entity";
import { SaleStatusBadge } from "./sale-status-badge";

interface SaleTimelineProps {
  status: SaleStatus;
  pickingEnabled: boolean;
  createdAt: Date;
  createdByName: string | null;
  confirmedAt: Date | null;
  confirmedByName: string | null;
  pickedAt: Date | null;
  pickedByName: string | null;
  shippedAt: Date | null;
  shippedByName: string | null;
  completedAt: Date | null;
  completedByName: string | null;
  cancelledAt: Date | null;
  cancelledByName: string | null;
  returnedAt?: Date | null;
  returnedByName?: string | null;
}

export function SaleTimeline({
  status,
  pickingEnabled,
  createdAt,
  createdByName,
  confirmedAt,
  confirmedByName,
  pickedAt,
  pickedByName,
  shippedAt,
  shippedByName,
  completedAt,
  completedByName,
  cancelledAt,
  cancelledByName,
  returnedAt,
  returnedByName,
}: SaleTimelineProps) {
  const locale = useLocale();
  const t = useTranslations("sales");

  const flow: SaleStatus[] = pickingEnabled
    ? ["DRAFT", "CONFIRMED", "PICKING", "SHIPPED", "COMPLETED"]
    : ["DRAFT", "CONFIRMED"];

  const meta: Partial<
    Record<SaleStatus, { date?: Date | null; byName?: string | null }>
  > = {
    DRAFT: { date: createdAt, byName: createdByName },
    CONFIRMED: { date: confirmedAt, byName: confirmedByName },
    PICKING: { date: pickedAt, byName: pickedByName },
    SHIPPED: { date: shippedAt, byName: shippedByName },
    COMPLETED: { date: completedAt, byName: completedByName },
    CANCELLED: { date: cancelledAt, byName: cancelledByName },
    RETURNED: { date: returnedAt, byName: returnedByName },
  };

  const visible: SaleStatus[] =
    status === "CANCELLED"
      ? [...flow.filter((key) => meta[key]?.date), "CANCELLED"]
      : status === "RETURNED"
        ? [...flow, "RETURNED"]
        : flow;

  const currentIndex = flow.indexOf(status);

  const describe = (key: SaleStatus) => {
    if (key === "CANCELLED" || key === "RETURNED") return true;
    if (status === "RETURNED" || status === "CANCELLED") {
      return Boolean(meta[key]?.date);
    }
    return flow.indexOf(key) <= currentIndex;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {visible.map((key) => (
          <SaleStatusBadge key={key} status={key} active={status === key} />
        ))}
      </div>
      <ol className="flex flex-col gap-3">
        {visible.map((key) => {
          const step = meta[key];
          return (
            <li key={key} className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">
                {t(`timeline.${key.toLowerCase()}`)}
              </span>
              {describe(key) ? (
                <span className="text-sm text-muted-foreground">
                  {t(`timeline.${key.toLowerCase()}Description`)}
                </span>
              ) : null}
              {step?.byName ? (
                <span className="text-sm text-muted-foreground">{step.byName}</span>
              ) : null}
              {step?.date ? (
                <span className="text-xs text-muted-foreground">
                  {formatDateTimeMedium(step.date, locale)}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
