"use client";

import { useTranslations } from "next-intl";
import { FileEdit, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/ui/components/badge";
import type { SaleStatus } from "../../domain/entities/sale.entity";

interface SaleStatusBadgeProps {
  status: SaleStatus;
}

export function SaleStatusBadge({ status }: SaleStatusBadgeProps) {
  const t = useTranslations("sales.status");

  const config: Record<
    SaleStatus,
    {
      label: string;
      variant: "secondary" | "success" | "error";
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
    CANCELLED: {
      label: t("cancelled"),
      variant: "error",
      icon: XCircle,
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
