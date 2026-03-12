"use client";

import { Badge } from "@/ui/components/badge";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ImportStatus } from "@/modules/imports/domain/entities";

const statusVariantMap: Record<
  ImportStatus,
  "secondary" | "info" | "success" | "error" | "warning" | "default"
> = {
  PENDING: "secondary",
  VALIDATING: "info",
  VALIDATED: "warning",
  PROCESSING: "info",
  COMPLETED: "success",
  FAILED: "error",
};

interface ImportStatusBadgeProps {
  status: ImportStatus;
}

export function ImportStatusBadge({ status }: ImportStatusBadgeProps) {
  const t = useTranslations("imports.status");
  const variant = statusVariantMap[status];
  const isSpinning = status === "PROCESSING" || status === "VALIDATING";

  return (
    <Badge variant={variant} className="gap-1">
      {isSpinning && <Loader2 className="h-3 w-3 animate-spin" />}
      {t(status)}
    </Badge>
  );
}
