import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { ComboDetail } from "@/modules/inventory/presentation/components/combos";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { comboKeys } from "@/modules/inventory/presentation/hooks/combo.keys";
import { ComboMapper } from "@/modules/inventory/application/mappers/combo.mapper";
import type { ComboResponseDto } from "@/modules/inventory/application/dto/combo.dto";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ComboDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: comboKeys.detail(id),
      queryFn: async () => {
        const res = await serverFetch<{ data: ComboResponseDto }>(
          `/inventory/combos/${id}`,
        );
        return ComboMapper.toDomain(res.data);
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <ComboDetail comboId={id} />
    </HydrationBoundary>
  );
}
