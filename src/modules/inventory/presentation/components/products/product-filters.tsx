"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search, X, Filter } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { MultiSelect } from "@/ui/components/multi-select";
import { useDebounce } from "@/shared/presentation/hooks";
import { useCategories } from "@/modules/inventory/presentation/hooks";
import { useBrands } from "@/modules/brands/presentation/hooks/use-brands";
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
  const tCommon = useTranslations("inventory.common.filters");
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(searchValue, 300);
  const { data: categoriesData } = useCategories({ limit: 100 });
  const { data: brandsData } = useBrands({ isActive: true, limit: 100 });

  // Apply debounced search
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

  const handleClearFilters = () => {
    setSearchValue("");
    onFiltersChange({
      page: 1,
      limit: filters.limit,
      categoryIds: undefined,
      brandIds: undefined,
      statuses: undefined,
      search: undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  };

  const hasActiveFilters =
    (filters.statuses?.length ?? 0) > 0 ||
    (filters.categoryIds?.length ?? 0) > 0 ||
    (filters.brandIds?.length ?? 0) > 0 ||
    filters.search;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("search.placeholder")}
            className="pl-9"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
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
            <Label className="mb-2 block text-sm">{tCommon("status")}</Label>
            <MultiSelect
              value={filters.statuses ?? []}
              onValueChange={handleStatusChange}
              options={statusOptions}
              allLabel={t("filters.allStatuses")}
              selectedLabel={tCommon("status")}
            />
          </div>

          <div className="min-w-[220px] flex-1">
            <Label className="mb-2 block text-sm">
              {t("filters.category")}
            </Label>
            <MultiSelect
              value={filters.categoryIds ?? []}
              onValueChange={handleCategoryChange}
              options={categoryOptions}
              allLabel={t("filters.allCategories")}
              selectedLabel={t("filters.category")}
            />
          </div>

          <div className="min-w-[220px] flex-1">
            <Label className="mb-2 block text-sm">{t("filters.brand")}</Label>
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
        </div>
      )}
    </div>
  );
}
