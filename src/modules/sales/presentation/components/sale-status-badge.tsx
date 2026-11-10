"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/ui/components/badge";
import type { SaleStatus } from "@/modules/sales/domain/entities/sale.entity";

const variantByStatus = {
  DRAFT: "secondary",
  CONFIRMED: "success",
  PICKING: "warning",
  SHIPPED: "info",
  COMPLETED: "success",
  CANCELLED: "error",
  RETURNED: "warning",
} as const;

interface SaleStatusBadgeProps {
  status: SaleStatus;
  active?: boolean;
  className?: string;
}

export function SaleStatusBadge({
  status,
  active = false,
  className,
}: SaleStatusBadgeProps) {
  const t = useTranslations("sales.status");
  const labels: Record<SaleStatus, string> = {
    DRAFT: t("draft"),
    CONFIRMED: t("confirmed"),
    PICKING: t("picking"),
    SHIPPED: t("shipped"),
    COMPLETED: t("completed"),
    CANCELLED: t("cancelled"),
    RETURNED: t("returned"),
  };

  return (
    <Badge
      variant={active ? "default" : variantByStatus[status]}
      className={className}
    >
      {labels[status]}
    </Badge>
  );
}
