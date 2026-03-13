import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { ReturnDetail } from "@/modules/returns/presentation/components";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { returnKeys } from "@/modules/returns/presentation/hooks/return.keys";
import { ReturnMapper } from "@/modules/returns/application/mappers/return.mapper";
import type { ReturnResponseDto } from "@/modules/returns/application/dto/return.dto";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ReturnDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: returnKeys.detail(id),
      queryFn: async () => {
        const res = await serverFetch<{ data: ReturnResponseDto }>(`/returns/${id}`);
        return ReturnMapper.toDomain(res.data);
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <ReturnDetail returnId={id} />
    </HydrationBoundary>
  );
}
