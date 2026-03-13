import { getTranslations, setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { SaleList } from "@/modules/sales/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { saleKeys } from "@/modules/sales/presentation/hooks/sale.keys";
import { SaleMapper } from "@/modules/sales/application/mappers/sale.mapper";
import type { SaleApiRawDto } from "@/modules/sales/application/dto/sale.dto";
import type { Pagination } from "@/shared/application/dto";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function SalesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("sales");

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: saleKeys.list(),
      queryFn: async () => {
        const res = await serverFetch<{
          data: SaleApiRawDto[];
          pagination: Pagination;
        }>("/sales");
        return {
          data: res.data.map((item) => SaleMapper.fromApiRaw(item)),
          pagination: res.pagination,
        };
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.SALES_READ}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {t("title")}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              {t("description")}
            </p>
          </div>
          <SaleList />
        </div>
      </RequirePermission>
    </HydrationBoundary>
  );
}
