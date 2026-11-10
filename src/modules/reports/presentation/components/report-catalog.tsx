"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/ui/layout/page-header";
import { ReportCard } from "./report-card";
import type { ReportTypeValue } from "@/modules/reports/application/dto/report.dto";
import { REPORT_CATEGORIES } from "@/modules/reports/application/dto/report.dto";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";
import { useCompany } from "@/modules/companies/presentation/hooks/use-companies";

export function ReportCatalog() {
  const t = useTranslations("reports");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = REPORT_CATEGORIES.some(
    (category) => category.key === requestedTab,
  )
    ? requestedTab
    : "inventory";
  const companyId = useCompanyStore((s) => s.selectedCompanyId);
  const { data: company } = useCompany(companyId ?? "");

  return (
    <div className="space-y-4" data-testid="tabs" data-value={activeTab}>
      <PageHeader
        title={t("title")}
        description={
          company?.name
            ? t("scope", { company: company.name })
            : t("description")
        }
      />

      {REPORT_CATEGORIES.map(({ key, types }) => (
        <section
          key={key}
          className="space-y-3"
          data-testid={`tab-content-${key}`}
        >
          <h2 className="text-xs font-semibold text-muted-foreground">
            <span data-testid={`tab-${key}`}>{t(`categories.${key}`)}</span>
          </h2>
          <div className="space-y-3">
            {types.map((type) => (
              <ReportCard
                key={type}
                type={type as ReportTypeValue}
                title={t(`types.${type}`)}
                description={t(`types.${type}_desc`)}
                category={key}
                locale={locale}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
