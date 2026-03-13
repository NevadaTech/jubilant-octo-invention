import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { MovementFormPage } from "@/modules/inventory/presentation/components";
import { Skeleton } from "@/ui/components/skeleton";
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

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditMovementPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: movementKeys.detail(id),
      queryFn: async () => {
        const res = await serverFetch<{ data: StockMovementResponseDto }>(
          `/inventory/movements/${id}`,
        );
        return StockMovementMapper.toDomain(res.data);
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <RequirePermission permission={PERMISSIONS.INVENTORY_ENTRY}>
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <HydrationBoundary state={dehydrateState(queryClient)}>
          <MovementFormPage movementId={id} />
        </HydrationBoundary>
      </Suspense>
    </RequirePermission>
  );
}
