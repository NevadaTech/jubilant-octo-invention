"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/ui/components/badge";
import type { ReturnType } from "@/modules/returns/domain/entities/return.entity";

interface ReturnTypeBadgeProps {
  type: ReturnType;
  className?: string;
}

export function ReturnTypeBadge({ type, className }: ReturnTypeBadgeProps) {
  const t = useTranslations("returns.types");

  return (
    <Badge
      variant={type === "RETURN_CUSTOMER" ? "info" : "warning"}
      className={className}
    >
      {type === "RETURN_CUSTOMER" ? t("customer") : t("supplier")}
    </Badge>
  );
}