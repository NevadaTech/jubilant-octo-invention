import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { ReturnList } from "@/modules/returns/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { returnKeys } from "@/modules/returns/presentation/hooks/return.keys";
import { ReturnMapper } from "@/modules/returns/application/mappers/return.mapper";
import type { ReturnApiRawDto } from "@/modules/returns/application/dto/return.dto";
import type { Pagination } from "@/shared/application/dto";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ReturnsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: returnKeys.list(),
      queryFn: async () => {
        const res = await serverFetch<{
          data: ReturnApiRawDto[];
          pagination: Pagination;
        }>("/returns");
        return {
          data: res.data.map((item) => ReturnMapper.fromApiRaw(item)),
          pagination: res.pagination,
        };
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.RETURNS_READ}>
        <ReturnList />
      </RequirePermission>
    </HydrationBoundary>
  );
}
