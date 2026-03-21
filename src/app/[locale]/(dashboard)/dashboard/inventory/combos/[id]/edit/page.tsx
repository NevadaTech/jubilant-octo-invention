import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { ComboForm } from "@/modules/inventory/presentation/components/combos";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { comboKeys } from "@/modules/inventory/presentation/hooks/combo.keys";
import { ComboMapper } from "@/modules/inventory/application/mappers/combo.mapper";
import { productKeys } from "@/modules/inventory/presentation/hooks/product.keys";
import { mapApiProductToDto } from "@/modules/inventory/infrastructure/adapters/product-api.adapter";
import { ProductMapper } from "@/modules/inventory/application/mappers/product.mapper";
import type { ComboResponseDto } from "@/modules/inventory/application/dto/combo.dto";
import type { ProductApiRawDto } from "@/modules/inventory/application/dto/product.dto";
import type { Pagination } from "@/shared/application/dto";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditComboPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: comboKeys.detail(id),
        queryFn: async () => {
          const res = await serverFetch<{ data: ComboResponseDto }>(
            `/inventory/combos/${id}`,
          );
          return ComboMapper.toDomain(res.data);
        },
      }),
      queryClient.prefetchQuery({
        queryKey: productKeys.list(),
        queryFn: async () => {
          const res = await serverFetch<{
            data: ProductApiRawDto[];
            pagination: Pagination;
          }>("/inventory/products");
          return {
            data: res.data.map((item) =>
              ProductMapper.toDomain(mapApiProductToDto(item)),
            ),
            pagination: res.pagination,
          };
        },
      }),
    ]);
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.COMBOS_UPDATE}>
        <ComboForm comboId={id} />
      </RequirePermission>
    </HydrationBoundary>
  );
}
