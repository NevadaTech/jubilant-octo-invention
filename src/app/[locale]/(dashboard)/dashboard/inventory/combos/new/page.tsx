import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { productKeys } from "@/modules/inventory/presentation/hooks/product.keys";
import { mapApiProductToDto } from "@/modules/inventory/infrastructure/adapters/product-api.adapter";
import { ProductMapper } from "@/modules/inventory/application/mappers/product.mapper";
import { ComboForm } from "@/modules/inventory/presentation/components/combos";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import type { ProductApiRawDto } from "@/modules/inventory/application/dto/product.dto";
import type { Pagination } from "@/shared/application/dto";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NewComboPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
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
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.COMBOS_CREATE}>
        <ComboForm />
      </RequirePermission>
    </HydrationBoundary>
  );
}
