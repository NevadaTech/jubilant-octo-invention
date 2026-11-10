"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { MultiSelect } from "@/ui/components/multi-select";
import { useDebounce } from "@/shared/presentation/hooks";
import { useCategories } from "@/modules/inventory/presentation/hooks";
import { useBrands } from "@/modules/brands/presentation/hooks/use-brands";
import { catalogFilterLabel } from "./catalog-chrome";
import type { ProductFilters as ProductFiltersType } from "@/modules/inventory/application/dto/product.dto";

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onFiltersChange: (filters: ProductFiltersType) => void;
}

export function ProductFilters({
  filters,
  onFiltersChange,
}: ProductFiltersProps) {
  const t = useTranslations("inventory.products");
  const tCommon = useTranslations("common");
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const debouncedSearch = useDebounce(searchValue, 300);
  const { data: categoriesData } = useCategories({ limit: 100 });
  const { data: brandsData } = useBrands({ isActive: true, limit: 100 });

  useEffect(() => {
    const currentSearch = filters.search || "";
    if (debouncedSearch !== currentSearch) {
      onFiltersChange({
        ...filters,
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

  const categoryOptions = useMemo(
    () =>
      categoriesData?.data.map((cat) => ({
        value: cat.id,
        label: cat.name,
      })) ?? [],
    [categoriesData],
  );

  const brandOptions = useMemo(
    () =>
      brandsData?.data.map((brand) => ({
        value: brand.id,
        label: brand.name,
      })) ?? [],
    [brandsData],
  );

  const handleStatusChange = (values: string[]) => {
    onFiltersChange({
      ...filters,
      statuses: values.length > 0 ? values : undefined,
      page: 1,
    });
  };

  const handleCategoryChange = (values: string[]) => {
    onFiltersChange({
      ...filters,
      categoryIds: values.length > 0 ? values : undefined,
      page: 1,
    });
  };

  const handleBrandChange = (values: string[]) => {
    onFiltersChange({
      ...filters,
      brandIds: values.length > 0 ? values : undefined,
      page: 1,
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="space-y-1 sm:w-64">
        <Label htmlFor="product-search" className={catalogFilterLabel}>
          {tCommon("search")}
        </Label>
        <Input
          id="product-search"
          type="search"
          placeholder={t("search.byNameOrSku")}
          className="h-10"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      <div className="space-y-1 sm:w-44">
        <Label className={catalogFilterLabel}>{t("filters.category")}</Label>
        <MultiSelect
          value={filters.categoryIds ?? []}
          onValueChange={handleCategoryChange}
          options={categoryOptions}
          allLabel={t("filters.allCategories")}
          selectedLabel={t("filters.category")}
        />
      </div>

      <div className="space-y-1 sm:w-44">
        <Label className={catalogFilterLabel}>{t("filters.brand")}</Label>
        <MultiSelect
          value={filters.brandIds ?? []}
          onValueChange={handleBrandChange}
          options={brandOptions}
          allLabel={t("filters.allBrands")}
          selectedLabel={t("filters.brand")}
          searchable
          searchPlaceholder={t("filters.searchBrand")}
        />
      </div>

      <div className="space-y-1 sm:w-44">
        <Label className={catalogFilterLabel}>{t("fields.status")}</Label>
        <MultiSelect
          value={filters.statuses ?? []}
          onValueChange={handleStatusChange}
          options={statusOptions}
          allLabel={t("filters.allStatuses")}
          selectedLabel={t("fields.status")}
        />
      </div>
    </div>
  );
}
