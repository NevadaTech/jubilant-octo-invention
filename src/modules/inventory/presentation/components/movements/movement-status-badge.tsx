"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/ui/components/badge";
import type { MovementStatus } from "@/modules/inventory/domain/entities/stock-movement.entity";

interface MovementStatusBadgeProps {
  status: MovementStatus;
}

const variantByStatus = {
  DRAFT: "secondary",
  POSTED: "success",
  VOID: "error",
  RETURNED: "warning",
} as const;

export function MovementStatusBadge({ status }: MovementStatusBadgeProps) {
  const t = useTranslations("inventory.movements.status");

  return (
    <Badge
      variant={variantByStatus[status]}
      className="rounded-full px-2 py-0.5 text-xs font-semibold"
    >
      {t(status.toLowerCase() as "draft" | "posted" | "void" | "returned")}
    </Badge>
  );
}
