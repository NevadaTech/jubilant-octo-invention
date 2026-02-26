import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ReportViewer } from "@/modules/reports/presentation/components";
import { slugToReportType } from "@/modules/reports/presentation/utils/report-utils";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string; type: string }>;
}

export default async function ReportDetailPage({ params }: Props) {
  const { locale, type } = await params;
  setRequestLocale(locale);

  const reportType = slugToReportType(type);
  if (!reportType) notFound();

  const t = await getTranslations("reports");

  const title = t(`types.${reportType}`);
  const description = t(`types.${reportType}_desc`);

  return (
    <RequirePermission permission={PERMISSIONS.REPORTS_READ}>
      <ReportViewer type={reportType} title={title} description={description} />
    </RequirePermission>
  );
}
