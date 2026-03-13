import { getTranslations, setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { ProductList } from "@/modules/inventory/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { productKeys } from "@/modules/inventory/presentation/hooks/product.keys";
import { mapApiProductToDto } from "@/modules/inventory/infrastructure/adapters/product-api.adapter";
import { ProductMapper } from "@/modules/inventory/application/mappers/product.mapper";
import type { ProductApiRawDto } from "@/modules/inventory/application/dto/product.dto";
import type { Pagination } from "@/shared/application/dto";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("inventory.products");

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
      <RequirePermission permission={PERMISSIONS.PRODUCTS_READ}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {t("title")}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              {t("description")}
            </p>
          </div>
          <ProductList />
        </div>
      </RequirePermission>
    </HydrationBoundary>
  );
}
