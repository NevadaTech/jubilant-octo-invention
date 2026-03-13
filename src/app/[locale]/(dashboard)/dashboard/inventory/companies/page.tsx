import { getTranslations, setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { CompanyList } from "@/modules/companies/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { companyKeys } from "@/modules/companies/presentation/hooks/company.keys";
import { CompanyMapper } from "@/modules/companies/application/mappers/company.mapper";
import type { CompanyResponseDto } from "@/modules/companies/application/dto/company.dto";
import type { Pagination } from "@/shared/application/dto";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function CompaniesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("inventory.companies");

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: companyKeys.list(),
      queryFn: async () => {
        const res = await serverFetch<{
          data: CompanyResponseDto[];
          pagination: Pagination;
        }>("/inventory/companies");
        return {
          data: res.data.map((item) => CompanyMapper.toDomain(item)),
          pagination: res.pagination,
        };
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.COMPANIES_READ}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {t("title")}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              {t("description")}
            </p>
          </div>
          <CompanyList />
        </div>
      </RequirePermission>
    </HydrationBoundary>
  );
}
