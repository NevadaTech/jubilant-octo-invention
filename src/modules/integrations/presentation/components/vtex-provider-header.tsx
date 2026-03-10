"use client";

import { useTranslations } from "next-intl";
import { Plug } from "lucide-react";
import { Card, CardContent } from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";
import type { IntegrationConnection } from "@/modules/integrations/domain/entities/integration-connection.entity";

interface VtexProviderHeaderProps {
  connections: IntegrationConnection[];
}

export function VtexProviderHeader({ connections }: VtexProviderHeaderProps) {
  const t = useTranslations("integrations");

  const total = connections.length;
  const connected = connections.filter((c) => c.isConnected).length;
  const withErrors = connections.filter((c) => c.hasError).length;

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
          <Plug className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{t("providers.vtex.name")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("providers.vtex.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {t("stats.totalConnections", { count: total })}
          </Badge>
          {connected > 0 && (
            <Badge variant="success">
              {t("stats.connected", { count: connected })}
            </Badge>
          )}
          {withErrors > 0 && (
            <Badge variant="destructive">
              {t("stats.withErrors", { count: withErrors })}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
