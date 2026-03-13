import { getTranslations, setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { MovementList } from "@/modules/inventory/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { movementKeys } from "@/modules/inventory/presentation/hooks/movement.keys";
import { StockMovementMapper } from "@/modules/inventory/application/mappers/stock-movement.mapper";
import type { StockMovementResponseDto } from "@/modules/inventory/application/dto/stock-movement.dto";
import type { Pagination } from "@/shared/application/dto";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function MovementsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("inventory.movements");

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: movementKeys.list(),
      queryFn: async () => {
        const res = await serverFetch<{
          data: StockMovementResponseDto[];
          pagination: Pagination;
        }>("/inventory/movements");
        return {
          data: res.data.map((item) => StockMovementMapper.toDomain(item)),
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
          <MovementList />
        </div>
      </RequirePermission>
    </HydrationBoundary>
  );
}
