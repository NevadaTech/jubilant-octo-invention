import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { TransferList } from "@/modules/inventory/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { transferKeys } from "@/modules/inventory/presentation/hooks/transfer.keys";
import { TransferMapper } from "@/modules/inventory/application/mappers/transfer.mapper";
import type { TransferApiRawDto } from "@/modules/inventory/application/dto/transfer.dto";
import type { Pagination } from "@/shared/application/dto";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function TransfersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: transferKeys.list(),
      queryFn: async () => {
        const res = await serverFetch<{
          data: TransferApiRawDto[];
          pagination: Pagination;
        }>("/inventory/transfers");
        return {
          data: res.data.map((item) => TransferMapper.fromApiRaw(item)),
          pagination: res.pagination,
        };
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.INVENTORY_TRANSFER}>
        <TransferList />
      </RequirePermission>
    </HydrationBoundary>
  );
}
