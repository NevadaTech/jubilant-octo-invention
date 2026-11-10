import { setRequestLocale } from "next-intl/server";
import { DashboardContent } from "@/modules/dashboard";
import { DashboardPageHeader } from "@/modules/dashboard/presentation/components/dashboard-page-header";

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-4">
      <DashboardPageHeader />
      <DashboardContent />
    </div>
  );
}
