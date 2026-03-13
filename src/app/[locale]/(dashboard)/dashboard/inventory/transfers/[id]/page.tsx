import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { TransferDetail } from "@/modules/inventory/presentation/components";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { transferKeys } from "@/modules/inventory/presentation/hooks/transfer.keys";
import { TransferMapper } from "@/modules/inventory/application/mappers/transfer.mapper";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function TransferDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: transferKeys.detail(id),
      queryFn: async () => {
        const res = await serverFetch<{ data: any }>(
          `/inventory/transfers/${id}`,
        );
        return TransferMapper.toDomain(res.data);
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <TransferDetail transferId={id} />
    </HydrationBoundary>
  );
}
