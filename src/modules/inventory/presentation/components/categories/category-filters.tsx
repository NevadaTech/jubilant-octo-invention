"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { MultiSelect } from "@/ui/components/multi-select";
import { useDebounce } from "@/shared/presentation/hooks";
import { catalogFilterLabel } from "../products/catalog-chrome";
import type { CategoryFilters } from "@/modules/inventory/application/dto/category.dto";

interface CategoryFiltersProps {
  filters: CategoryFilters;
  onFiltersChange: (filters: Partial<CategoryFilters>) => void;
}

export function CategoryFiltersComponent({
  filters,
  onFiltersChange,
}: CategoryFiltersProps) {
  const t = useTranslations("inventory.categories");
  const tCommon = useTranslations("common");
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const debouncedSearch = useDebounce(searchValue, 300);

  useEffect(() => {
    const currentSearch = filters.search || "";
    if (debouncedSearch !== currentSearch) {
      onFiltersChange({
        search: debouncedSearch || undefined,
        page: 1,
      });
    }
  }, [debouncedSearch]);

  const statusOptions = useMemo(
    () => [
      { value: "ACTIVE", label: t("status.active") },
      { value: "INACTIVE", label: t("status.inactive") },
    ],
    [t],
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="space-y-1 sm:w-64">
        <Label htmlFor="category-search" className={catalogFilterLabel}>
          {tCommon("search")}
        </Label>
        <Input
          id="category-search"
          type="search"
          placeholder={t("search.placeholder")}
          className="h-10"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
      <div className="space-y-1 sm:w-48">
        <Label className={catalogFilterLabel}>{t("filters.status")}</Label>
        <MultiSelect
          value={filters.statuses ?? []}
          onValueChange={(values) =>
            onFiltersChange({
              statuses: values.length > 0 ? values : undefined,
              page: 1,
            })
          }
          options={statusOptions}
          allLabel={t("filters.allStatuses")}
          selectedLabel={t("filters.status")}
        />
      </div>
    </div>
  );
}
