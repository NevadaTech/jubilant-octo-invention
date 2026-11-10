"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/ui/components/badge";
import type { TransferStatus } from "@/modules/inventory/domain/entities/transfer.entity";

interface TransferStatusBadgeProps {
  status: TransferStatus;
}

const variantByStatus = {
  DRAFT: "secondary",
  IN_TRANSIT: "info",
  PARTIAL: "warning",
  RECEIVED: "success",
  REJECTED: "error",
  CANCELED: "error",
} as const;

export function TransferStatusBadge({ status }: TransferStatusBadgeProps) {
  const t = useTranslations("inventory.transfers.status");
  const key = status.toLowerCase() as
    | "draft"
    | "in_transit"
    | "partial"
    | "received"
    | "rejected"
    | "canceled";

  return (
    <Badge
      variant={variantByStatus[status]}
      className="rounded-full px-2 py-0.5 text-xs font-semibold"
    >
      {t(key)}
    </Badge>
  );
}
