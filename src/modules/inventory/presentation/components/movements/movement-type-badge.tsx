"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/ui/components/badge";
import type { MovementType } from "@/modules/inventory/domain/entities/stock-movement.entity";

interface MovementTypeBadgeProps {
  type: MovementType;
}

const variantByType = {
  IN: "success",
  OUT: "error",
  ADJUST_IN: "success",
  ADJUST_OUT: "error",
  TRANSFER_IN: "info",
  TRANSFER_OUT: "warning",
} as const;

export function MovementTypeBadge({ type }: MovementTypeBadgeProps) {
  const t = useTranslations("inventory.movements.types");

  return (
    <Badge
      variant={variantByType[type]}
      className="rounded-full px-2 py-0.5 text-xs font-semibold"
    >
      {t(
        type.toLowerCase() as
          | "in"
          | "out"
          | "adjust_in"
          | "adjust_out"
          | "transfer_in"
          | "transfer_out",
      )}
    </Badge>
  );
}
