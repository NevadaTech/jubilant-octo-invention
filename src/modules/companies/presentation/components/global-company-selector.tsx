"use client";

import { useTranslations } from "next-intl";
import { Building2, ChevronDown } from "lucide-react";
import { Button } from "@/ui/components/button";
import { useCompanies } from "@/modules/companies/presentation/hooks/use-companies";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";
import { useOrgSettings } from "@/shared/presentation/hooks/use-org-settings";

export function GlobalCompanySelector() {
  const t = useTranslations("inventory.companies");
  const { multiCompanyEnabled } = useOrgSettings();
  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);
  const setSelectedCompany = useCompanyStore((s) => s.setSelectedCompany);
  const { data, isLoading } = useCompanies({ isActive: true, limit: 100 });

  if (!multiCompanyEnabled) return null;

  const selectedCompany = data?.data.find((c) => c.id === selectedCompanyId);

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="min-w-[180px]">
        <Building2 className="mr-2 h-4 w-4" />
        {t("selector.loading")}
      </Button>
    );
  }

  return (
    <div className="relative">
      <select
        value={selectedCompanyId || ""}
        onChange={(e) => setSelectedCompany(e.target.value || null)}
        className="absolute inset-0 w-full cursor-pointer opacity-0"
        aria-label={t("selector.label")}
      >
        <option value="">{t("selector.all")}</option>
        {data?.data.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name} ({company.code})
          </option>
        ))}
      </select>
      <Button
        variant="outline"
        className="min-w-[180px] justify-between pointer-events-none"
      >
        <span className="flex items-center">
          <Building2 className="mr-2 h-4 w-4" />
          {selectedCompany ? `${selectedCompany.name}` : t("selector.all")}
        </span>
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
