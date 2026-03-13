import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { saleKeys } from "@/modules/sales/presentation/hooks/sale.keys";
import { SaleMapper } from "@/modules/sales/application/mappers/sale.mapper";
import type { SaleApiRawDto } from "@/modules/sales/application/dto/sale.dto";
import type { Pagination } from "@/shared/application/dto";
import { ReturnFormPage } from "@/modules/returns/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NewReturnPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: saleKeys.list(),
      queryFn: async () => {
        const res = await serverFetch<{
          data: SaleApiRawDto[];
          pagination: Pagination;
        }>("/sales");
        return {
          data: res.data.map((item) => SaleMapper.fromApiRaw(item)),
          pagination: res.pagination,
        };
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.RETURNS_CREATE}>
        <ReturnFormPage />
      </RequirePermission>
    </HydrationBoundary>
  );
}
