"use client";

import { Badge } from "@/ui/components/badge";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/ui/lib/utils";
import type { ImportStatus } from "@/modules/imports/domain/entities";

const statusClassName: Record<ImportStatus, string> = {
  PENDING: "border-transparent bg-muted text-muted-foreground",
  VALIDATING: "border-transparent bg-info-100 text-info-800",
  VALIDATED: "border-transparent bg-warning-100 text-warning-800",
  PROCESSING: "border-transparent bg-info-100 text-info-800",
  COMPLETED: "border-transparent bg-success-100 text-success-800",
  FAILED: "border-transparent bg-error-100 text-destructive",
};

interface ImportStatusBadgeProps {
  status: ImportStatus;
}

export function ImportStatusBadge({ status }: ImportStatusBadgeProps) {
  const t = useTranslations("imports.status");
  const isSpinning = status === "PROCESSING" || status === "VALIDATING";

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        statusClassName[status],
      )}
    >
      {isSpinning && <Loader2 className="h-3 w-3 animate-spin" />}
      {t(status)}
    </Badge>
  );
}
