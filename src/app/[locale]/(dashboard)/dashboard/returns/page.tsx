import { getTranslations, setRequestLocale } from "next-intl/server";
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

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ReturnsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("returns");

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: returnKeys.list(),
      queryFn: async () => {
        const res = await serverFetch<{ data: any[]; pagination: any }>(
          "/returns",
        );
        return {
          data: res.data.map((item: any) => ReturnMapper.fromApiRaw(item)),
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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {t("title")}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              {t("description")}
            </p>
          </div>
          <ReturnList />
        </div>
      </RequirePermission>
    </HydrationBoundary>
  );
}
