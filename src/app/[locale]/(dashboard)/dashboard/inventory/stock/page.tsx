import { setRequestLocale } from "next-intl/server";
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
import type { StockApiRawDto } from "@/modules/inventory/application/dto/stock.dto";
import type { Pagination } from "@/shared/application/dto";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function StockPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: stockKeys.list(),
      queryFn: async () => {
        const res = await serverFetch<{
          data: StockApiRawDto[];
          pagination: Pagination;
        }>("/inventory/stock");
        return {
          data: res.data.map((item, index) =>
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
        <StockTable />
      </RequirePermission>
    </HydrationBoundary>
  );
}
