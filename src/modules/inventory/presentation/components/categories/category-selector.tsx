"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { useCategories } from "../../hooks/use-categories";

interface CategorySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  includeAll?: boolean;
  disabled?: boolean;
}

export function CategorySelector({
  value,
  onValueChange,
  includeAll = true,
  disabled = false,
}: CategorySelectorProps) {
  const t = useTranslations("inventory.categories");
  const { data, isLoading } = useCategories({ limit: 100, isActive: true });

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger disabled={disabled || isLoading}>
        <SelectValue
          placeholder={isLoading ? t("selector.loading") : t("selector.label")}
        />
      </SelectTrigger>
      <SelectContent>
        {includeAll && <SelectItem value="">{t("selector.all")}</SelectItem>}
        {data?.data.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
