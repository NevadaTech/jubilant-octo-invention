import { setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import { ImportDashboard } from "@/modules/imports/presentation/components";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { importKeys } from "@/modules/imports/presentation/hooks/import.keys";
import { ImportMapper } from "@/modules/imports/application/mappers/import.mapper";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ImportsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: importKeys.list(),
      queryFn: async () => {
        const res = await serverFetch<{ data: any[]; pagination: any }>(
          "/imports",
        );
        return res.data.map((item: any) => ImportMapper.toDomain(item));
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.PRODUCTS_IMPORT}>
        <ImportDashboard />
      </RequirePermission>
    </HydrationBoundary>
  );
}
