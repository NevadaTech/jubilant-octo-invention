"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search, X, Filter } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { MultiSelect } from "@/ui/components/multi-select";
import { DateRangePicker } from "@/ui/components/date-range-picker";
import { useDebounce } from "@/shared/presentation/hooks";
import { useWarehouses } from "@/modules/inventory/presentation/hooks";
import type { SaleFilters } from "@/modules/sales/application/dto/sale.dto";
import type { SaleStatus } from "@/modules/sales/domain/entities/sale.entity";
import type { ContactType } from "@/modules/contacts/domain/entities/contact.entity";
import type { DateRange } from "react-day-picker";

interface SaleFiltersProps {
  filters: SaleFilters;
  onFiltersChange: (filters: SaleFilters) => void;
}

const SALE_STATUSES: SaleStatus[] = [
  "DRAFT",
  "CONFIRMED",
  "PICKING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
  "RETURNED",
];

const CONTACT_TYPES: ContactType[] = ["CUSTOMER", "SUPPLIER", "EMPLOYEE"];
const INTEGRATION_PROVIDERS = ["VTEX", "MERCADOLIBRE"] as const;

export function SaleFiltersComponent({
  filters,
  onFiltersChange,
}: SaleFiltersProps) {
  const t = useTranslations("sales");
  const tCommon = useTranslations("common");
  const tContacts = useTranslations("contacts");
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(searchValue, 300);
  const { data: warehousesData } = useWarehouses({ limit: 100 });

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

  const handleStatusChange = (statuses: string[]) => {
    onFiltersChange({
      ...filters,
      status: statuses.length > 0 ? (statuses as SaleStatus[]) : undefined,
      page: 1,
    });
  };

  const warehouseOptions = useMemo(
    () =>
      warehousesData?.data.map((wh) => ({
        value: wh.id,
        label: wh.name,
      })) ?? [],
    [warehousesData],
  );

  const handleWarehouseChange = (values: string[]) => {
    onFiltersChange({
      ...filters,
      warehouseIds: values.length > 0 ? values : undefined,
      page: 1,
    });
  };

  const handleContactTypeChange = (values: string[]) => {
    onFiltersChange({
      ...filters,
      contactType: values.length === 1 ? values[0] : undefined,
      page: 1,
    });
  };

  const handleIntegrationProviderChange = (values: string[]) => {
    onFiltersChange({
      ...filters,
      integrationProvider: values.length === 1 ? values[0] : undefined,
      page: 1,
    });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    const startDate = range?.from
      ? format(range.from, "yyyy-MM-dd")
      : undefined;
    const endDate = range?.to ? format(range.to, "yyyy-MM-dd") : undefined;
    onFiltersChange({
      ...filters,
      startDate,
      endDate,
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

  const hasActiveFilters =
    (filters.status?.length ?? 0) > 0 ||
    (filters.warehouseIds?.length ?? 0) > 0 ||
    filters.contactType ||
    filters.integrationProvider ||
    filters.startDate ||
    filters.endDate ||
    filters.search;

  const statusOptions = SALE_STATUSES.map((s) => ({
    value: s,
    label: t(`status.${s.toLowerCase()}`),
  }));

  const contactTypeOptions = CONTACT_TYPES.map((ct) => ({
    value: ct,
    label: tContacts(`types.${ct}`),
  }));

  const integrationProviderOptions = INTEGRATION_PROVIDERS.map((ip) => ({
    value: ip,
    label: ip === "MERCADOLIBRE" ? "MercadoLibre" : ip,
  }));

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
          <div className="min-w-[200px]">
            <Label className="mb-2 block text-sm">{t("filters.status")}</Label>
            <MultiSelect
              value={filters.status || []}
              onValueChange={handleStatusChange}
              options={statusOptions}
              allLabel={t("filters.allStatuses")}
              selectedLabel={tCommon("selected")}
            />
          </div>

          <div className="min-w-[200px] flex-1">
            <Label className="mb-2 block text-sm">
              {t("filters.warehouse")}
            </Label>
            <MultiSelect
              value={filters.warehouseIds ?? []}
              onValueChange={handleWarehouseChange}
              options={warehouseOptions}
              allLabel={t("filters.allWarehouses")}
              selectedLabel={t("filters.warehouse")}
            />
          </div>

          <div className="min-w-[200px]">
            <Label className="mb-2 block text-sm">
              {t("filters.contactType")}
            </Label>
            <MultiSelect
              value={filters.contactType ? [filters.contactType] : []}
              onValueChange={handleContactTypeChange}
              options={contactTypeOptions}
              allLabel={t("filters.allContactTypes")}
              selectedLabel={t("filters.contactType")}
            />
          </div>

          <div className="min-w-[200px]">
            <Label className="mb-2 block text-sm">
              {t("filters.integrationProvider")}
            </Label>
            <MultiSelect
              value={
                filters.integrationProvider ? [filters.integrationProvider] : []
              }
              onValueChange={handleIntegrationProviderChange}
              options={integrationProviderOptions}
              allLabel={t("filters.allIntegrations")}
              selectedLabel={t("filters.integrationProvider")}
            />
          </div>

          <div className="min-w-[280px]">
            <Label className="mb-2 block text-sm">
              {t("filters.dateRange")}
            </Label>
            <DateRangePicker
              value={
                filters.startDate || filters.endDate
                  ? {
                      from: filters.startDate
                        ? new Date(filters.startDate + "T00:00:00")
                        : undefined,
                      to: filters.endDate
                        ? new Date(filters.endDate + "T00:00:00")
                        : undefined,
                    }
                  : undefined
              }
              onChange={handleDateRangeChange}
              placeholder={t("filters.selectDateRange")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
