import { getTranslations, setRequestLocale } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { AuditLogList } from "@/modules/audit/presentation/components";
import { RequirePermission } from "@/shared/presentation/components/require-permission";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  createServerQueryClient,
  dehydrateState,
} from "@/shared/infrastructure/prefetch/server-prefetch";
import { serverFetch } from "@/shared/infrastructure/http/server-fetch";
import { auditLogKeys } from "@/modules/audit/presentation/hooks/audit-log.keys";
import { AuditLogMapper } from "@/modules/audit/application/mappers/audit-log.mapper";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AuditPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.audit");

  const queryClient = createServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: auditLogKeys.list(),
      queryFn: async () => {
        const res = await serverFetch<{ data: any[]; pagination: any }>(
          "/audit/logs",
        );
        return {
          data: res.data.map((item: any) => AuditLogMapper.toDomain(item)),
          pagination: res.pagination,
        };
      },
    });
  } catch {
    /* client-side fallback */
  }

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <RequirePermission permission={PERMISSIONS.AUDIT_READ}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <AuditLogList />
        </div>
      </RequirePermission>
    </HydrationBoundary>
  );
}
