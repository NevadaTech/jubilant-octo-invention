import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { MovementDetail } from "@/modules/inventory/presentation/components/movements/movement-detail";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { movementKeys } from "@/modules/inventory/presentation/hooks/movement.keys";
import { StockMovementMapper } from "@/modules/inventory/application/mappers/stock-movement.mapper";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function MovementDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: movementKeys.detail(id),
      queryFn: async () => {
        const res = await serverFetch<{ data: any }>(
          `/inventory/movements/${id}`,
        );
        return StockMovementMapper.toDomain(res.data);
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <MovementDetail movementId={id} />
    </HydrationBoundary>
  );
}
