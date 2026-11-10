"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/ui/components/badge";
import type { IntegrationConnection } from "@/modules/integrations/domain/entities/integration-connection.entity";

interface MeliProviderHeaderProps {
  connections: IntegrationConnection[];
}

export function MeliProviderHeader({ connections }: MeliProviderHeaderProps) {
  const t = useTranslations("integrations");

  const total = connections.length;
  const connected = connections.filter((c) => c.isConnected).length;
  const withErrors = connections.filter((c) => c.hasError).length;
  const needsReauth = connections.filter((c) => c.needsReauth).length;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          {t("providers.mercadolibre.name")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("providers.mercadolibre.description")}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="rounded-full border-transparent bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
        >
          {t("stats.totalConnections", { count: total })}
        </Badge>
        {connected > 0 && (
          <Badge
            variant="outline"
            className="rounded-full border-transparent bg-success-100 px-2.5 py-0.5 text-xs font-semibold text-success-800"
          >
            {t("stats.connected", { count: connected })}
          </Badge>
        )}
        {withErrors > 0 && (
          <Badge
            variant="outline"
            className="rounded-full border-transparent bg-error-100 px-2.5 py-0.5 text-xs font-semibold text-destructive"
          >
            {t("stats.withErrors", { count: withErrors })}
          </Badge>
        )}
        {needsReauth > 0 && (
          <Badge
            variant="outline"
            className="rounded-full border-transparent bg-warning-100 px-2.5 py-0.5 text-xs font-semibold text-warning-800"
          >
            {t("stats.needsReauth", { count: needsReauth })}
          </Badge>
        )}
      </div>
    </div>
  );
}
