"use client";

import { useMemo } from "react";
import { Skeleton } from "@/ui/components/skeleton";
import { VtexConnectionDetail } from "./vtex-connection-detail";
import { MeliConnectionDetail } from "./meli-connection-detail";
import { useIntegration } from "@/modules/integrations/presentation/hooks/use-integrations";
import { IntegrationConnectionMapper } from "@/modules/integrations/application/mappers/integration-connection.mapper";
import type { IntegrationConnectionResponseDto } from "@/modules/integrations/application/dto/integration-connection.dto";

interface IntegrationDetailRouterProps {
  connectionId: string;
  serverData?: IntegrationConnectionResponseDto | null;
}

export function IntegrationDetailRouter({
  connectionId,
  serverData,
}: IntegrationDetailRouterProps) {
  const initialConnection = useMemo(
    () =>
      serverData ? IntegrationConnectionMapper.toDomain(serverData) : null,
    [serverData],
  );

  const { data: connection, isLoading } = useIntegration(connectionId, {
    initialData: initialConnection,
  });

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
