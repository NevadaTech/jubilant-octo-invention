import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { IntegrationsPage } from "@/modules/integrations/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { integrationKeys } from "@/modules/integrations/presentation/hooks/integration.keys";
import { IntegrationConnectionMapper } from "@/modules/integrations/application/mappers/integration-connection.mapper";
import type { IntegrationConnectionResponseDto } from "@/modules/integrations/application/dto/integration-connection.dto";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function IntegrationsListPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: integrationKeys.list(),
      queryFn: async () => {
        const res = await serverFetch<{ data: IntegrationConnectionResponseDto[] }>(
          "/integrations/connections",
        );
        return res.data.map((item) =>
          IntegrationConnectionMapper.toDomain(item),
        );
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.INTEGRATIONS_READ}>
        <IntegrationsPage />
      </RequirePermission>
    </HydrationBoundary>
  );
}
