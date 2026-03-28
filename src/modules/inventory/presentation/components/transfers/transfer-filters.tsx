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
import type { TransferFilters } from "@/modules/inventory/application/dto/transfer.dto";
import type { TransferStatus } from "@/modules/inventory/domain/entities/transfer.entity";
import type { DateRange } from "react-day-picker";

interface TransferFiltersProps {
  filters: TransferFilters;
  onFiltersChange: (filters: TransferFilters) => void;
}

const TRANSFER_STATUSES: TransferStatus[] = [
  "DRAFT",
  "IN_TRANSIT",
  "PARTIAL",
  "RECEIVED",
  "REJECTED",
  "CANCELED",
];

export function TransferFiltersComponent({
  filters,
  onFiltersChange,
}: TransferFiltersProps) {
  const t = useTranslations("inventory.transfers");
  const tCommon = useTranslations("common");
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

  const statusOptions = useMemo(
    () =>
      TRANSFER_STATUSES.map((s) => ({
        value: s,
        label: t(`status.${s.toLowerCase()}`),
      })),
    [t],
  );

  const warehouseOptions = useMemo(
    () =>
      warehousesData?.data.map((wh) => ({
        value: wh.id,
        label: wh.name,
      })) ?? [],
    [warehousesData],
  );

  const handleStatusChange = (values: string[]) => {
    onFiltersChange({
      ...filters,
      status: values.length > 0 ? (values as TransferStatus[]) : undefined,
      page: 1,
    });
  };

  const handleFromWarehouseChange = (values: string[]) => {
    onFiltersChange({
      ...filters,
      fromWarehouseIds: values.length > 0 ? values : undefined,
      page: 1,
    });
  };

  const handleToWarehouseChange = (values: string[]) => {
    onFiltersChange({
      ...filters,
      toWarehouseIds: values.length > 0 ? values : undefined,
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
      status: undefined,
      fromWarehouseIds: undefined,
      toWarehouseIds: undefined,
      startDate: undefined,
      endDate: undefined,
      search: undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  };

  const hasActiveFilters =
    (filters.status?.length ?? 0) > 0 ||
    (filters.fromWarehouseIds?.length ?? 0) > 0 ||
    (filters.toWarehouseIds?.length ?? 0) > 0 ||
    filters.startDate ||
    filters.endDate ||
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
          <div className="min-w-[200px] flex-1">
            <Label className="mb-2 block text-sm">{t("filters.status")}</Label>
            <MultiSelect
              value={filters.status ?? []}
              onValueChange={handleStatusChange}
              options={statusOptions}
              allLabel={t("filters.allStatuses")}
              selectedLabel={t("filters.status")}
            />
          </div>

          <div className="min-w-[200px] flex-1">
            <Label className="mb-2 block text-sm">
              {t("filters.fromWarehouse")}
            </Label>
            <MultiSelect
              value={filters.fromWarehouseIds ?? []}
              onValueChange={handleFromWarehouseChange}
              options={warehouseOptions}
              allLabel={t("filters.allWarehouses")}
              selectedLabel={t("filters.fromWarehouse")}
            />
          </div>

          <div className="min-w-[200px] flex-1">
            <Label className="mb-2 block text-sm">
              {t("filters.toWarehouse")}
            </Label>
            <MultiSelect
              value={filters.toWarehouseIds ?? []}
              onValueChange={handleToWarehouseChange}
              options={warehouseOptions}
              allLabel={t("filters.allWarehouses")}
              selectedLabel={t("filters.toWarehouse")}
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
