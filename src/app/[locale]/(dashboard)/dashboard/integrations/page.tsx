import { setRequestLocale } from "next-intl/server";
import { IntegrationsPage } from "@/modules/integrations/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function IntegrationsListPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.INTEGRATIONS_READ}>
      <IntegrationsPage />
    </RequirePermission>
  );
}
