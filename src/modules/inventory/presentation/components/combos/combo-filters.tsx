"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { useDebounce } from "@/shared/presentation/hooks";
import { catalogFilterLabel } from "../products/catalog-chrome";
import type { GetCombosQueryDto } from "@/modules/inventory/application/dto/combo.dto";

interface ComboFiltersProps {
  filters: GetCombosQueryDto;
  onFiltersChange: (filters: GetCombosQueryDto) => void;
}

export function ComboFilters({ filters, onFiltersChange }: ComboFiltersProps) {
  const t = useTranslations("inventory.combos");
  const [nameValue, setNameValue] = useState(filters.name || "");
  const [skuValue, setSkuValue] = useState(filters.sku || "");
  const debouncedName = useDebounce(nameValue, 300);
  const debouncedSku = useDebounce(skuValue, 300);

  useEffect(() => {
    const currentName = filters.name || "";
    if (debouncedName !== currentName) {
      onFiltersChange({
        ...filters,
        name: debouncedName || undefined,
        page: 1,
      });
    }
  }, [debouncedName]);

  useEffect(() => {
    const currentSku = filters.sku || "";
    if (debouncedSku !== currentSku) {
      onFiltersChange({
        ...filters,
        sku: debouncedSku || undefined,
        page: 1,
      });
    }
  }, [debouncedSku]);

  const statusValue = useMemo(() => {
    if (filters.isActive === undefined) return "all";
    return filters.isActive ? "active" : "inactive";
  }, [filters.isActive]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="space-y-1 sm:w-56">
        <Label htmlFor="combo-name" className={catalogFilterLabel}>
          {t("fields.name")}
        </Label>
        <Input
          id="combo-name"
          type="search"
          placeholder={t("search.namePlaceholder")}
          className="h-10"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
        />
      </div>
      <div className="space-y-1 sm:w-48">
        <Label htmlFor="combo-sku" className={catalogFilterLabel}>
          {t("fields.sku")}
        </Label>
        <Input
          id="combo-sku"
          type="search"
          placeholder={t("search.skuPlaceholder")}
          className="h-10 font-mono"
          value={skuValue}
          onChange={(e) => setSkuValue(e.target.value)}
        />
      </div>
      <div className="space-y-1 sm:w-44">
        <Label className={catalogFilterLabel}>{t("fields.status")}</Label>
        <Select
          value={statusValue}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              isActive: value === "all" ? undefined : value === "active",
              page: 1,
            })
          }
        >
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allStatuses")}</SelectItem>
            <SelectItem value="active">{t("status.active")}</SelectItem>
            <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
