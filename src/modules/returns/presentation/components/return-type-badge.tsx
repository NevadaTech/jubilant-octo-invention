"use client";

import { useTranslations } from "next-intl";
import { UserCheck, Truck } from "lucide-react";
import { Badge } from "@/ui/components/badge";
import type { ReturnType } from "@/modules/returns/domain/entities/return.entity";

interface ReturnTypeBadgeProps {
  type: ReturnType;
}

export function ReturnTypeBadge({ type }: ReturnTypeBadgeProps) {
  const t = useTranslations("returns.types");

  const config: Record<
    ReturnType,
    { label: string; variant: "info" | "warning"; icon: typeof UserCheck }
  > = {
    RETURN_CUSTOMER: {
      label: t("customer"),
      variant: "info",
      icon: UserCheck,
    },
    RETURN_SUPPLIER: {
      label: t("supplier"),
      variant: "warning",
      icon: Truck,
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
