"use client";

import { useTranslations } from "next-intl";
import { FileEdit, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/ui/components/badge";
import type { ReturnStatus } from "@/modules/returns/domain/entities/return.entity";

interface ReturnStatusBadgeProps {
  status: ReturnStatus;
}

export function ReturnStatusBadge({ status }: ReturnStatusBadgeProps) {
  const t = useTranslations("returns.status");

  const config: Record<
    ReturnStatus,
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
