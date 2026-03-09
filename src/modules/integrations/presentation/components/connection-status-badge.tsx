"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/ui/components/badge";
import type { ConnectionStatus } from "@/modules/integrations/domain/entities/integration-connection.entity";

const statusVariantMap: Record<
  ConnectionStatus,
  "success" | "destructive" | "secondary"
> = {
  CONNECTED: "success",
  ERROR: "destructive",
  DISCONNECTED: "secondary",
};

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus;
}

export function ConnectionStatusBadge({ status }: ConnectionStatusBadgeProps) {
  const t = useTranslations("integrations.status");
  const variant = statusVariantMap[status] ?? "secondary";

  return <Badge variant={variant}>{t(status)}</Badge>;
}
