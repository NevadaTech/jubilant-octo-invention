"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Warehouse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { TablePagination } from "@/ui/components/table-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/ui/components/searchable-select";
import { useComboAvailability } from "@/modules/inventory/presentation/hooks/use-combos";
import { useWarehouses } from "@/modules/inventory/presentation/hooks/use-warehouses";
import type { GetComboAvailabilityQueryDto } from "@/modules/inventory/application/dto/combo.dto";

function formatCurrency(amount: number, currency = "COP"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function AvailabilityTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* eslint-disable @eslint-react/no-array-index-key */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
        >
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
        </div>
      ))}
      {/* eslint-enable @eslint-react/no-array-index-key */}
    </div>
  );
}

export function ComboAvailabilityTable() {
  const t = useTranslations("inventory.combos");
  const tCommon = useTranslations("common");
  const [filters, setFilters] = useState<GetComboAvailabilityQueryDto>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading, isError, error } = useComboAvailability(filters);
  const { data: warehousesResult } = useWarehouses();

  const warehouseOptions: SearchableSelectOption[] = useMemo(
    () =>
      warehousesResult?.data.map((w) => ({
        value: w.id,
        label: w.name,
      })) ?? [],
    [warehousesResult],
  );

  const statusValue = useMemo(() => {
    if (filters.isActive === undefined) return "all";
    return filters.isActive ? "active" : "inactive";
  }, [filters.isActive]);

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (size: number) => {
    setFilters((prev) => ({ ...prev, limit: size, page: 1 }));
  };

  if (isError) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">
            {t("error.loading")}: {error?.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Flatten: one row per combo+warehouse
  const rows = useMemo(() => {
    if (!data?.data) return [];
    return data.data.flatMap((combo) =>
      combo.availability.map((wh) => ({
        comboId: combo.id,
        sku: combo.sku,
        name: combo.name,
        price: combo.price,
        isActive: combo.isActive,
        warehouseName: wh.warehouseName,
        warehouseId: wh.warehouseId,
        available: wh.available,
      })),
    );
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t("availability.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 rounded-lg border bg-muted/30 p-4">
          <div className="min-w-[180px] flex-1">
            <Label className="mb-2 block text-sm">{t("fields.name")}</Label>
            <Input
              type="search"
              placeholder={t("search.namePlaceholder")}
              value={filters.name || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  name: e.target.value || undefined,
                  page: 1,
                }))
              }
            />
          </div>

          <div className="min-w-[150px] flex-1">
            <Label className="mb-2 block text-sm">{t("fields.sku")}</Label>
            <Input
              type="search"
              placeholder={t("search.skuPlaceholder")}
              value={filters.sku || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sku: e.target.value || undefined,
                  page: 1,
                }))
              }
            />
          </div>

          <div className="min-w-[200px] flex-1">
            <Label className="mb-2 block text-sm">
              {t("fields.warehouse")}
            </Label>
            <SearchableSelect
              options={warehouseOptions}
              value={filters.warehouseId || ""}
              onValueChange={(val) =>
                setFilters((prev) => ({
                  ...prev,
                  warehouseId: val || undefined,
                  page: 1,
                }))
              }
              placeholder={t("filters.allWarehouses")}
            />
          </div>

          <div className="min-w-[150px] flex-1">
            <Label className="mb-2 block text-sm">{t("fields.status")}</Label>
            <Select
              value={statusValue}
              onValueChange={(val) =>
                setFilters((prev) => ({
                  ...prev,
                  isActive: val === "all" ? undefined : val === "active",
                  page: 1,
                }))
              }
            >
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

        {/* Table */}
        {isLoading ? (
          <AvailabilityTableSkeleton />
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Warehouse className="mb-4 h-12 w-12 text-neutral-400 dark:text-neutral-500" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("availability.empty")}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm font-medium text-muted-foreground">
                    <th className="px-4 py-3">{t("fields.sku")}</th>
                    <th className="px-4 py-3">{t("fields.name")}</th>
                    <th className="px-4 py-3">{t("fields.price")}</th>
                    <th className="px-4 py-3">{t("fields.status")}</th>
                    <th className="px-4 py-3">{t("fields.warehouse")}</th>
                    <th className="px-4 py-3">{t("fields.available")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={`${row.comboId}-${row.warehouseId}`}
                      className="border-b border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-primary-50/50 dark:hover:bg-primary-950/20"
                    >
                      <td className="px-4 py-3 text-sm text-foreground">
                        {row.sku}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {formatCurrency(row.price)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={row.isActive ? "success" : "secondary"}>
                          {row.isActive
                            ? t("status.active")
                            : t("status.inactive")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        <div className="flex items-center gap-2">
                          <Warehouse className="h-4 w-4 text-neutral-400" />
                          {row.warehouseName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            row.available > 0
                              ? "font-medium text-success-600 dark:text-success-400"
                              : "font-medium text-destructive"
                          }
                        >
                          {row.available}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data?.pagination && (
              <TablePagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                total={data.pagination.total}
                limit={data.pagination.limit}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                showingLabel={tCommon("pagination.showing", {
                  from: (data.pagination.page - 1) * data.pagination.limit + 1,
                  to: Math.min(
                    data.pagination.page * data.pagination.limit,
                    data.pagination.total,
                  ),
                  total: data.pagination.total,
                })}
                perPageLabel={tCommon("pagination.perPage")}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
