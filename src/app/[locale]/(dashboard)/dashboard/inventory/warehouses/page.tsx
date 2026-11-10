import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { WarehouseList } from "@/modules/inventory/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { warehouseKeys } from "@/modules/inventory/presentation/hooks/warehouse.keys";
import { WarehouseMapper } from "@/modules/inventory/application/mappers/warehouse.mapper";
import type { WarehouseResponseDto } from "@/modules/inventory/application/dto/warehouse.dto";
import type { Pagination } from "@/shared/application/dto";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function WarehousesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: warehouseKeys.list(),
      queryFn: async () => {
        const res = await serverFetch<{
          data: WarehouseResponseDto[];
          pagination: Pagination;
        }>("/inventory/warehouses");
        return {
          data: res.data.map((item) => WarehouseMapper.toDomain(item)),
          pagination: res.pagination,
        };
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.WAREHOUSES_READ}>
        <WarehouseList />
      </RequirePermission>
    </HydrationBoundary>
  );
}
