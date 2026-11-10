import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { ComboList } from "@/modules/inventory/presentation/components/combos";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { comboKeys } from "@/modules/inventory/presentation/hooks/combo.keys";
import { ComboMapper } from "@/modules/inventory/application/mappers/combo.mapper";
import type { ComboResponseDto } from "@/modules/inventory/application/dto/combo.dto";
import type { Pagination } from "@/shared/application/dto";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function CombosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: comboKeys.list(),
      queryFn: async () => {
        const res = await serverFetch<{
          data: ComboResponseDto[];
          pagination: Pagination;
        }>("/inventory/combos");
        return {
          data: res.data.map((item) => ComboMapper.toDomain(item)),
          pagination: res.pagination,
        };
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.COMBOS_READ}>
        <ComboList />
      </RequirePermission>
    </HydrationBoundary>
  );
}
