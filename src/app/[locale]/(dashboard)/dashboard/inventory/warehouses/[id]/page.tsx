import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { WarehouseDetail } from "@/modules/inventory/presentation/components";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { warehouseKeys } from "@/modules/inventory/presentation/hooks/warehouse.keys";
import { WarehouseMapper } from "@/modules/inventory/application/mappers/warehouse.mapper";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function WarehouseDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: warehouseKeys.detail(id),
      queryFn: async () => {
        const res = await serverFetch<{ data: any }>(
          `/inventory/warehouses/${id}`,
        );
        return WarehouseMapper.toDomain(res.data);
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <WarehouseDetail warehouseId={id} />
    </HydrationBoundary>
  );
}
