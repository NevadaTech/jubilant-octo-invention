"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { useCompanies } from "@/modules/companies/presentation/hooks/use-companies";

interface CompanySelectorProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
}

export function CompanySelector({
  value,
  onChange,
  placeholder,
  disabled,
  allowClear = false,
}: CompanySelectorProps) {
  const t = useTranslations("inventory.companies");
  const { data, isLoading } = useCompanies({ isActive: true, limit: 100 });

  return (
    <Select
      value={value || ""}
      onValueChange={(v) => onChange(v === "__all__" ? undefined : v)}
      disabled={disabled || isLoading}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder || t("selector.placeholder")} />
      </SelectTrigger>
      <SelectContent>
        {allowClear && (
          <SelectItem value="__all__">{t("selector.all")}</SelectItem>
        )}
        {data?.data.map((company) => (
          <SelectItem key={company.id} value={company.id}>
            {company.name} ({company.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
