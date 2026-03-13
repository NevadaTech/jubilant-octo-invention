import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { SaleDetail } from "@/modules/sales/presentation/components";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { saleKeys } from "@/modules/sales/presentation/hooks/sale.keys";
import { SaleMapper } from "@/modules/sales/application/mappers/sale.mapper";
import type { SaleResponseDto } from "@/modules/sales/application/dto/sale.dto";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function SaleDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: saleKeys.detail(id),
      queryFn: async () => {
        const res = await serverFetch<{ data: SaleResponseDto }>(`/sales/${id}`);
        return SaleMapper.toDomain(res.data);
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <SaleDetail saleId={id} />
    </HydrationBoundary>
  );
}
