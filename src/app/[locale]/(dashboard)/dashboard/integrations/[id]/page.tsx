import { setRequestLocale } from "next-intl/server";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import { IntegrationDetailRouter } from "@/modules/integrations/presentation/components/integration-detail-router";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import type { IntegrationConnectionDetailResponseDto } from "@/modules/integrations/application/dto/integration-connection.dto";
import type { IntegrationConnectionResponseDto } from "@/modules/integrations/application/dto/integration-connection.dto";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function IntegrationDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  let serverData: IntegrationConnectionResponseDto | null = null;
  try {
    const response = await serverFetch<IntegrationConnectionDetailResponseDto>(
      `/integrations/connections/${id}`,
    );
    serverData = response.data;
  } catch {
    // Fall back to client-side fetch
  }

  return (
    <RequirePermission permission={PERMISSIONS.INTEGRATIONS_READ}>
      <IntegrationDetailRouter connectionId={id} serverData={serverData} />
    </RequirePermission>
  );
}
