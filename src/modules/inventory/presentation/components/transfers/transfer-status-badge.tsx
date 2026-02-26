"use client";

import { useTranslations } from "next-intl";
import {
  FileEdit,
  Truck,
  PackageCheck,
  CheckCircle2,
  XCircle,
  Ban,
} from "lucide-react";
import { Badge } from "@/ui/components/badge";
import type { TransferStatus } from "@/modules/inventory/domain/entities/transfer.entity";

interface TransferStatusBadgeProps {
  status: TransferStatus;
}

export function TransferStatusBadge({ status }: TransferStatusBadgeProps) {
  const t = useTranslations("inventory.transfers.status");

  const config: Record<
    TransferStatus,
    {
      label: string;
      variant: "warning" | "info" | "success" | "error" | "secondary";
      icon: typeof FileEdit;
    }
  > = {
    DRAFT: {
      label: t("draft"),
      variant: "secondary",
      icon: FileEdit,
    },
    IN_TRANSIT: {
      label: t("in_transit"),
      variant: "info",
      icon: Truck,
    },
    PARTIAL: {
      label: t("partial"),
      variant: "warning",
      icon: PackageCheck,
    },
    RECEIVED: {
      label: t("received"),
      variant: "success",
      icon: CheckCircle2,
    },
    REJECTED: {
      label: t("rejected"),
      variant: "error",
      icon: XCircle,
    },
    CANCELED: {
      label: t("canceled"),
      variant: "error",
      icon: Ban,
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
