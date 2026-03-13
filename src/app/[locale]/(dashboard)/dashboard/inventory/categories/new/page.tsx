import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { categoryKeys } from "@/modules/inventory/presentation/hooks/category.keys";
import { CategoryMapper } from "@/modules/inventory/application/mappers/category.mapper";
import { CategoryFormPage } from "@/modules/inventory/presentation/components/categories";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import type { CategoryResponseDto } from "@/modules/inventory/application/dto/category.dto";
import type { Pagination } from "@/shared/application/dto";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NewCategoryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: categoryKeys.list(),
      queryFn: async () => {
        const res = await serverFetch<{
          data: CategoryResponseDto[];
          pagination: Pagination;
        }>("/inventory/categories");
        return {
          data: res.data.map((item) => CategoryMapper.toDomain(item)),
          pagination: res.pagination,
        };
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.PRODUCTS_CREATE}>
        <CategoryFormPage />
      </RequirePermission>
    </HydrationBoundary>
  );
}
