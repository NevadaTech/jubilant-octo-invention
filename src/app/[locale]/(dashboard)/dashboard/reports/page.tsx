import { setRequestLocale } from "next-intl/server";
import { ReportCatalog } from "@/modules/reports/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ReportsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <RequirePermission permission={PERMISSIONS.REPORTS_READ}>
      <ReportCatalog />
    </RequirePermission>
  );
}
