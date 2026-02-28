"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search, X, Filter } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { MultiSelect } from "@/ui/components/multi-select";
import { useDebounce } from "@/shared/presentation/hooks";
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
  const [showFilters, setShowFilters] = useState(false);
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

  const handleStatusChange = (values: string[]) => {
    onFiltersChange({
      statuses: values.length > 0 ? values : undefined,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setSearchValue("");
    onFiltersChange({
      search: undefined,
      statuses: undefined,
      page: 1,
    });
  };

  const hasActiveFilters =
    (filters.statuses?.length ?? 0) > 0 || filters.search;

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
          {tCommon("filter")}
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              !
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="mr-2 h-4 w-4" />
            {tCommon("clearFilters")}
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-4 rounded-lg border bg-muted/30 p-4">
          <div className="min-w-[180px] flex-1">
            <Label className="mb-2 block text-sm">{t("filters.status")}</Label>
            <MultiSelect
              value={filters.statuses ?? []}
              onValueChange={handleStatusChange}
              options={statusOptions}
              allLabel={t("filters.allStatuses")}
              selectedLabel={t("filters.status")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
