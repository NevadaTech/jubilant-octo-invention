import { getTranslations, setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { StockTable } from "@/modules/inventory/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { stockKeys } from "@/modules/inventory/presentation/hooks/stock.keys";
import { StockMapper } from "@/modules/inventory/application/mappers/stock.mapper";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function StockPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("inventory.stock");

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: stockKeys.list(),
      queryFn: async () => {
        const res = await serverFetch<{
          data: any[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        }>("/inventory/stock");
        return {
          data: res.data.map((item: any, index: number) =>
            StockMapper.toDomain(item, index),
          ),
          pagination: res.pagination,
        };
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.INVENTORY_READ}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {t("title")}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              {t("description")}
            </p>
          </div>
          <StockTable />
        </div>
      </RequirePermission>
    </HydrationBoundary>
  );
}
