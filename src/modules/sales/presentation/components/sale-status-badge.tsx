"use client";

import { useTranslations } from "next-intl";
import {
  FileEdit,
  CheckCircle2,
  XCircle,
  PackageSearch,
  Truck,
  PackageCheck,
  Undo2,
} from "lucide-react";
import { Badge } from "@/ui/components/badge";
import type { SaleStatus } from "@/modules/sales/domain/entities/sale.entity";

interface SaleStatusBadgeProps {
  status: SaleStatus;
}

export function SaleStatusBadge({ status }: SaleStatusBadgeProps) {
  const t = useTranslations("sales.status");

  const config: Record<
    SaleStatus,
    {
      label: string;
      variant: "secondary" | "success" | "warning" | "info" | "error";
      icon: typeof FileEdit;
    }
  > = {
    DRAFT: {
      label: t("draft"),
      variant: "secondary",
      icon: FileEdit,
    },
    CONFIRMED: {
      label: t("confirmed"),
      variant: "success",
      icon: CheckCircle2,
    },
    PICKING: {
      label: t("picking"),
      variant: "warning",
      icon: PackageSearch,
    },
    SHIPPED: {
      label: t("shipped"),
      variant: "info",
      icon: Truck,
    },
    COMPLETED: {
      label: t("completed"),
      variant: "success",
      icon: PackageCheck,
    },
    CANCELLED: {
      label: t("cancelled"),
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
