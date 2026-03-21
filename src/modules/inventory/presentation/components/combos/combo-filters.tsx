"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search, X, Filter } from "lucide-react";
import { Button } from "@/ui/components/button";
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
import type { GetCombosQueryDto } from "@/modules/inventory/application/dto/combo.dto";

interface ComboFiltersProps {
  filters: GetCombosQueryDto;
  onFiltersChange: (filters: GetCombosQueryDto) => void;
}

export function ComboFilters({ filters, onFiltersChange }: ComboFiltersProps) {
  const t = useTranslations("inventory.combos");
  const tCommon = useTranslations("inventory.common.filters");
  const [nameValue, setNameValue] = useState(filters.name || "");
  const [skuValue, setSkuValue] = useState(filters.sku || "");
  const [showFilters, setShowFilters] = useState(false);
  const debouncedName = useDebounce(nameValue, 300);
  const debouncedSku = useDebounce(skuValue, 300);

  // Apply debounced name search
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

  // Apply debounced SKU search
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

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      isActive: value === "all" ? undefined : value === "active",
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setNameValue("");
    setSkuValue("");
    onFiltersChange({
      page: 1,
      limit: filters.limit,
      isActive: undefined,
      name: undefined,
      sku: undefined,
    });
  };

  const statusValue = useMemo(() => {
    if (filters.isActive === undefined) return "all";
    return filters.isActive ? "active" : "inactive";
  }, [filters.isActive]);

  const hasActiveFilters =
    filters.isActive !== undefined || filters.name || filters.sku;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("search.namePlaceholder")}
            className="pl-9"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {t("filter")}
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              !
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="mr-2 h-4 w-4" />
            {tCommon("clear")}
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-4 rounded-lg border bg-muted/30 p-4">
          <div className="min-w-[180px] flex-1">
            <Label className="mb-2 block text-sm">{t("fields.sku")}</Label>
            <Input
              type="search"
              placeholder={t("search.skuPlaceholder")}
              value={skuValue}
              onChange={(e) => setSkuValue(e.target.value)}
            />
          </div>

          <div className="min-w-[180px] flex-1">
            <Label className="mb-2 block text-sm">{tCommon("status")}</Label>
            <Select value={statusValue} onValueChange={handleStatusChange}>
              <SelectTrigger>
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
      )}
    </div>
  );
}
