"use client";

import { useState, useEffect } from "react";
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
import type { ProductFilters as ProductFiltersType } from "../../../application/dto/product.dto";

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

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      isActive: status === "all" ? undefined : status === "active",
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setSearchValue("");
    onFiltersChange({
      page: 1,
      limit: filters.limit,
    });
  };

  const hasActiveFilters = filters.isActive !== undefined || filters.search;

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
          <div className="min-w-[150px]">
            <Label className="mb-2 block text-sm">{tCommon("status")}</Label>
            <Select
              value={
                filters.isActive === undefined
                  ? "all"
                  : filters.isActive
                    ? "active"
                    : "inactive"
              }
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
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
