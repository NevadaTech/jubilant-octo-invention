"use client";

import { Skeleton } from "@/ui/components/skeleton";
import { VtexConnectionDetail } from "./vtex-connection-detail";
import { MeliConnectionDetail } from "./meli-connection-detail";
import { useIntegration } from "@/modules/integrations/presentation/hooks/use-integrations";

interface IntegrationDetailRouterProps {
  connectionId: string;
}

export function IntegrationDetailRouter({
  connectionId,
}: IntegrationDetailRouterProps) {
  const { data: connection, isLoading } = useIntegration(connectionId);

  if (isLoading && !connection) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (connection?.provider === "MERCADOLIBRE") {
    return <MeliConnectionDetail connectionId={connectionId} />;
  }

  return <VtexConnectionDetail connectionId={connectionId} />;
}
