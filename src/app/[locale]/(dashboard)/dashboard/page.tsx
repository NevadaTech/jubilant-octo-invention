import { getTranslations, setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { DashboardContent } from "@/modules/dashboard";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { dashboardKeys } from "@/modules/dashboard/presentation/hooks/dashboard.keys";
import type { DashboardMetricsDto } from "@/modules/dashboard/application/dto";

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: dashboardKeys.metrics(),
      queryFn: async () => {
        const res = await serverFetch<{ data: DashboardMetricsDto }>("/dashboard/metrics");
        return res.data;
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <DashboardContent />
      </div>
    </HydrationBoundary>
  );
}
