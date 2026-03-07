import { setRequestLocale } from "next-intl/server";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import { ImportDashboard } from "@/modules/imports/presentation/components";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ImportsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.PRODUCTS_IMPORT}>
      <ImportDashboard />
    </RequirePermission>
  );
}
