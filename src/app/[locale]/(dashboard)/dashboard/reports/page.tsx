import { setRequestLocale } from "next-intl/server";
import { ReportCatalog } from "@/modules/reports/presentation/components";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ReportsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ReportCatalog />;
}
