import { getTranslations, setRequestLocale } from "next-intl/server";
import { DashboardContent } from "@/modules/dashboard";

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <DashboardContent />
    </div>
  );
}
