"use client";

import { useTranslations } from "next-intl";
import { FileEdit, CheckCircle2, XCircle, Undo2 } from "lucide-react";
import { Badge } from "@/ui/components/badge";
import type { MovementStatus } from "@/modules/inventory/domain/entities/stock-movement.entity";

interface MovementStatusBadgeProps {
  status: MovementStatus;
}

export function MovementStatusBadge({ status }: MovementStatusBadgeProps) {
  const t = useTranslations("inventory.movements.status");

  const config: Record<
    MovementStatus,
    {
      label: string;
      variant: "secondary" | "success" | "error" | "warning";
      icon: typeof FileEdit;
    }
  > = {
    DRAFT: {
      label: t("draft"),
      variant: "secondary",
      icon: FileEdit,
    },
    POSTED: {
      label: t("posted"),
      variant: "success",
      icon: CheckCircle2,
    },
    VOID: {
      label: t("void"),
      variant: "error",
      icon: XCircle,
    },
    RETURNED: {
      label: t("returned"),
      variant: "warning",
      icon: Undo2,
    },
  };

  const { label, variant, icon: Icon } = config[status];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
