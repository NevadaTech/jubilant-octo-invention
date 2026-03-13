import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { CategoryFormPage } from "@/modules/inventory/presentation/components/categories";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { categoryKeys } from "@/modules/inventory/presentation/hooks/category.keys";
import { CategoryMapper } from "@/modules/inventory/application/mappers/category.mapper";
import type { CategoryResponseDto } from "@/modules/inventory/application/dto/category.dto";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: categoryKeys.detail(id),
      queryFn: async () => {
        const res = await serverFetch<{ data: CategoryResponseDto }>(
          `/inventory/categories/${id}`,
        );
        return CategoryMapper.toDomain(res.data);
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.PRODUCTS_UPDATE}>
        <CategoryFormPage categoryId={id} />
      </RequirePermission>
    </HydrationBoundary>
  );
}
