import { setRequestLocale } from "next-intl/server";
import { VtexConnectionDetail } from "@/modules/integrations/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function IntegrationDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.INTEGRATIONS_READ}>
      <VtexConnectionDetail connectionId={id} />
    </RequirePermission>
  );
}
