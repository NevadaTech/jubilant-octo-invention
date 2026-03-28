"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { useBrands } from "@/modules/brands/presentation/hooks/use-brands";

interface BrandSelectorProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
}

export function BrandSelector({
  value,
  onChange,
  placeholder,
  disabled,
  allowClear = false,
}: BrandSelectorProps) {
  const t = useTranslations("inventory.brands");
  const { data, isLoading } = useBrands({ isActive: true, limit: 100 });

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
        {data?.data.map((brand) => (
          <SelectItem key={brand.id} value={brand.id}>
            {brand.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
