"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/ui/components/badge";
import { cn } from "@/ui/lib/utils";
import type { ConnectionStatus } from "@/modules/integrations/domain/entities/integration-connection.entity";

const statusClassName: Record<ConnectionStatus, string> = {
  CONNECTED: "border-transparent bg-success-100 text-success-800",
  ERROR: "border-transparent bg-error-100 text-destructive",
  DISCONNECTED: "border-transparent bg-muted text-muted-foreground",
};

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus;
}

export function ConnectionStatusBadge({ status }: ConnectionStatusBadgeProps) {
  const t = useTranslations("integrations.status");

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
        statusClassName[status] ?? statusClassName.DISCONNECTED,
      )}
    >
      {t(status)}
    </Badge>
  );
}
