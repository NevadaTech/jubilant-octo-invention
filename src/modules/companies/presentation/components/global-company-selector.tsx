"use client";

import { useTranslations } from "next-intl";
import { Building2, ChevronDown, Check } from "lucide-react";
import { Button } from "@/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[180px] justify-between">
          <span className="flex items-center">
            <Building2 className="mr-2 h-4 w-4" />
            {selectedCompany ? selectedCompany.name : t("selector.all")}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        <DropdownMenuItem onClick={() => setSelectedCompany(null)}>
          <Check
            className={`mr-2 h-4 w-4 ${selectedCompanyId === null ? "opacity-100" : "opacity-0"}`}
          />
          {t("selector.all")}
        </DropdownMenuItem>
        {data?.data.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => setSelectedCompany(company.id)}
          >
            <Check
              className={`mr-2 h-4 w-4 ${selectedCompanyId === company.id ? "opacity-100" : "opacity-0"}`}
            />
            {company.name}
            <span className="ml-auto text-xs text-muted-foreground">
              {company.code}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
