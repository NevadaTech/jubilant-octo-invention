import { getTranslations, setRequestLocale } from "next-intl/server";
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

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function TransfersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("inventory.transfers");

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: transferKeys.list(),
      queryFn: async () => {
        const res = await serverFetch<{
          data: any[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        }>("/inventory/transfers");
        return {
          data: res.data.map((item: any) => TransferMapper.fromApiRaw(item)),
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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {t("title")}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              {t("description")}
            </p>
          </div>
          <TransferList />
        </div>
      </RequirePermission>
    </HydrationBoundary>
  );
}
