"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/ui/layout/page-header";
import { useCompanies } from "@/modules/companies/presentation/hooks/use-companies";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";
import { TokenService } from "@/modules/authentication/infrastructure/services/token.service";

function scopeFromSlug(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase() + part.slice(1))
    .join(" ");
}

export function DashboardPageHeader() {
  const t = useTranslations("dashboard");
  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);
  const { data } = useCompanies({ isActive: true, limit: 100 });
  const [slugLabel, setSlugLabel] = useState<string | null>(null);

  useEffect(() => {
    const slug = TokenService.getOrganizationSlug();
    setSlugLabel(slug ? scopeFromSlug(slug) : null);
  }, []);

  const companies = data?.data ?? [];
  const selected = selectedCompanyId
    ? companies.find((company) => company.id === selectedCompanyId)
    : undefined;
  const single = companies.length === 1 ? companies[0] : undefined;

  let name = t("scopeAll");
  if (selected) name = selected.name;
  else if (single) name = single.name;
  else if (companies.length === 0 && slugLabel) name = slugLabel;

  return <PageHeader title={t("title")} description={t("scope", { name })} />;
}
