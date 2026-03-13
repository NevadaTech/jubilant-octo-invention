import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { ProductDetail } from "@/modules/inventory/presentation/components";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { productKeys } from "@/modules/inventory/presentation/hooks/product.keys";
import { mapApiProductToDto } from "@/modules/inventory/infrastructure/adapters/product-api.adapter";
import { ProductMapper } from "@/modules/inventory/application/mappers/product.mapper";
import type { ProductApiRawDto } from "@/modules/inventory/application/dto/product.dto";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: productKeys.detail(id),
      queryFn: async () => {
        const res = await serverFetch<{ data: ProductApiRawDto }>(
          `/inventory/products/${id}`,
        );
        return ProductMapper.toDomain(mapApiProductToDto(res.data));
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <ProductDetail productId={id} />
    </HydrationBoundary>
  );
}
