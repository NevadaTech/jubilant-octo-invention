"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/components/button";
import { useCompanies } from "@/modules/companies/presentation/hooks/use-companies";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";

interface CompanyRequiredGuardProps {
  children: ReactNode;
  /** When false, skip the guard (e.g. edit flows). Defaults to true. */
  active?: boolean;
}

/**
 * Fail-closed wrapper for create flows that require a specific company.
 * When the global selector is "All" (null), shows a notice and disables the form.
 */
export function CompanyRequiredGuard({
  children,
  active = true,
}: CompanyRequiredGuardProps) {
  const t = useTranslations("inventory.companies");
  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);
  const setSelectedCompany = useCompanyStore((s) => s.setSelectedCompany);
  const { data } = useCompanies({ isActive: true, limit: 100 });
  const isCompanySelected = selectedCompanyId !== null;

  if (!active || isCompanySelected) {
    return <>{children}</>;
  }

  const chooseCompany = () => {
    const companies = data?.data ?? [];
    if (companies.length === 1) {
      setSelectedCompany(companies[0].id);
      return;
    }
    const trigger = [...document.querySelectorAll("[data-company-selector]")].find(
      (node) => node instanceof HTMLButtonElement && node.getClientRects().length > 0,
    );
    if (trigger instanceof HTMLButtonElement) {
      trigger.focus();
      trigger.click();
    }
  };

  return (
    <div className="space-y-4">
      <div
        role="alert"
        className="w-full max-w-[560px] space-y-2 rounded-xl bg-warning-100 p-5"
      >
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">
          {t("requiredCompany.title")}
        </h1>
        <p className="text-[15px] leading-snug text-foreground">
          {t("requiredCompany.description")}
        </p>
        <Button type="button" className="mt-2" onClick={chooseCompany}>
          {t("requiredCompany.action")}
        </Button>
      </div>
      <fieldset disabled className="min-w-0 border-0 p-0">
        {children}
      </fieldset>
    </div>
  );
}
