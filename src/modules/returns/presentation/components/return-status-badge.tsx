"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/ui/components/badge";
import type { ReturnStatus } from "@/modules/returns/domain/entities/return.entity";

const variantByStatus = {
  DRAFT: "secondary",
  CONFIRMED: "success",
  CANCELLED: "error",
} as const;

interface ReturnStatusBadgeProps {
  status: ReturnStatus;
  className?: string;
}

export function ReturnStatusBadge({
  status,
  className,
}: ReturnStatusBadgeProps) {
  const t = useTranslations("returns.status");
  const labels: Record<ReturnStatus, string> = {
    DRAFT: t("draft"),
    CONFIRMED: t("confirmed"),
    CANCELLED: t("cancelled"),
  };

  return (
    <Badge variant={variantByStatus[status]} className={className}>
      {labels[status]}
    </Badge>
  );
}
