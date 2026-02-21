"use client";

import { useTranslations } from "next-intl";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  ArrowRightLeft,
} from "lucide-react";
import { Badge } from "@/ui/components/badge";
import type { MovementType } from "../../../domain/entities/stock-movement.entity";

interface MovementTypeBadgeProps {
  type: MovementType;
}

export function MovementTypeBadge({ type }: MovementTypeBadgeProps) {
  const t = useTranslations("inventory.movements.types");

  const config: Record<
    MovementType,
    {
      label: string;
      variant: "success" | "error" | "warning" | "info";
      icon: typeof ArrowDownCircle;
    }
  > = {
    IN: {
      label: t("in"),
      variant: "success",
      icon: ArrowDownCircle,
    },
    OUT: {
      label: t("out"),
      variant: "error",
      icon: ArrowUpCircle,
    },
    ADJUST_IN: {
      label: t("adjust_in"),
      variant: "success",
      icon: RefreshCw,
    },
    ADJUST_OUT: {
      label: t("adjust_out"),
      variant: "error",
      icon: RefreshCw,
    },
    TRANSFER_IN: {
      label: t("transfer_in"),
      variant: "info",
      icon: ArrowRightLeft,
    },
    TRANSFER_OUT: {
      label: t("transfer_out"),
      variant: "warning",
      icon: ArrowRightLeft,
    },
  };

  const { label, variant, icon: Icon } = config[type];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
