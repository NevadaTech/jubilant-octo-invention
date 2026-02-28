"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Package,
  Search,
  AlertTriangle,
  Warehouse,
  Settings2,
  Boxes,
  DollarSign,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { SortableHeader } from "@/ui/components/sortable-header";
import { MultiSelect } from "@/ui/components/multi-select";
import {
  useStock,
  useStockFilters,
  useSetStockFilters,
  useWarehouses,
} from "@/modules/inventory/presentation/hooks";
import type { StockFilters } from "@/modules/inventory/application/dto/stock.dto";
import { ReorderRuleDialog } from "./reorder-rule-dialog";
import type { Stock } from "@/modules/inventory/domain/entities/stock.entity";

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function StockRow({
  stock,
  onSetRule,
}: {
  stock: Stock;
  onSetRule: (stock: Stock) => void;
}) {
  const t = useTranslations("inventory.stock");
  const isLowStock = stock.availableQuantity <= 10;

  return (
    <tr className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <Package className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              {stock.productName || stock.productId}
            </p>
            {stock.productSku && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {stock.productSku}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
          <Warehouse className="h-4 w-4" />
          {stock.warehouseName || stock.warehouseId}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {isLowStock && <AlertTriangle className="h-4 w-4 text-warning-500" />}
          <span
            className={`font-medium ${
              isLowStock
                ? "text-warning-600 dark:text-warning-400"
                : stock.isOutOfStock
                  ? "text-destructive"
                  : "text-neutral-900 dark:text-neutral-100"
            }`}
          >
            {stock.quantity}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-neutral-600 dark:text-neutral-300">
          {formatCurrency(stock.averageCost, stock.currency)}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {formatCurrency(stock.totalValue, stock.currency)}
        </span>
      </td>
      <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400 text-sm">
        {stock.lastMovementAt
          ? new Date(stock.lastMovementAt).toLocaleDateString()
          : "-"}
      </td>
      <td className="px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => onSetRule(stock)}
        >
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">{t("actions.setRule")}</span>
        </Button>
      </td>
    </tr>
  );
}

function StockTableSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
        >
          <div className="h-10 w-10 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
          <div className="h-4 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  const t = useTranslations("inventory.stock");

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Package className="mb-4 h-12 w-12 text-neutral-400 dark:text-neutral-500" />
      <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">
        {t("empty.title")}
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {t("empty.description")}
      </p>
    </div>
  );
}

function StockSummaryCards({ items }: { items: Stock[] }) {
  const t = useTranslations("inventory.stock");
  const totalQuantity = items.reduce((sum, s) => sum + s.quantity, 0);
  const totalValue = items.reduce((sum, s) => sum + s.totalValue, 0);
  const lowStockCount = items.filter(
    (s) => s.availableQuantity <= 10 && s.availableQuantity > 0,
  ).length;
  const currency = items.find((s) => s.currency)?.currency || "USD";

  const cards = [
    {
      label: t("summary.totalItems"),
      value: items.length.toLocaleString(),
      icon: Package,
      color: "text-primary-600 dark:text-primary-400",
      bg: "bg-primary-100 dark:bg-primary-900/30",
    },
    {
      label: t("summary.totalQuantity"),
      value: totalQuantity.toLocaleString(),
      icon: Boxes,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: t("summary.totalValue"),
      value: formatCurrency(totalValue, currency),
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: t("summary.lowStockItems"),
      value: lowStockCount.toLocaleString(),
      icon: AlertTriangle,
      color: "text-warning-600 dark:text-warning-400",
      bg: "bg-warning-100 dark:bg-warning-900/30",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.bg}`}
          >
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">
              {card.label}
            </p>
            <p className="text-lg font-semibold text-foreground truncate">
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StockTable() {
  const t = useTranslations("inventory.stock");
  const tCommon = useTranslations("common");
  const filters = useStockFilters();
  const setFilters = useSetStockFilters();
  const { data, isLoading, isError, error } = useStock(filters);

  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [sortBy, setSortBy] = useState<StockFilters["sortBy"]>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value, page: 1 });
  };

  const { data: warehousesData } = useWarehouses({ limit: 100 });

  const warehouseOptions = useMemo(
    () =>
      warehousesData?.data.map((wh) => ({
        value: wh.id,
        label: wh.name,
      })) ?? [],
    [warehousesData],
  );

  const hasActiveFilters =
    filters.lowStock || (filters.warehouseIds?.length ?? 0) > 0;

  const handleSort = (field: string, order: "asc" | "desc" | undefined) => {
    setSortBy(order ? (field as StockFilters["sortBy"]) : undefined);
    setSortOrder(order);
  };

  const sortedData = (() => {
    if (!data?.data || !sortBy) return data?.data;
    const items = [...data.data];
    const field = sortBy;
    const dir = sortOrder === "desc" ? -1 : 1;
    return items.sort((a, b) => {
      const aVal = a[field as keyof Stock];
      const bVal = b[field as keyof Stock];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "string" && typeof bVal === "string")
        return aVal.localeCompare(bVal) * dir;
      return ((aVal as number) - (bVal as number)) * dir;
    });
  })();

  const handleSetRule = (stock: Stock) => {
    setSelectedStock(stock);
    setRuleDialogOpen(true);
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

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("search.placeholder")}
                  className="pl-9"
                  value={filters.search || ""}
                  onChange={handleSearch}
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setFilters({
                      lowStock: false,
                      warehouseIds: undefined,
                      page: 1,
                    })
                  }
                >
                  <X className="mr-2 h-4 w-4" />
                  {tCommon("clearFilters")}
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-4">
                <Button
                  variant={filters.lowStock ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setFilters({ lowStock: !filters.lowStock, page: 1 })
                  }
                  className="gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  {t("filters.lowStock")}
                </Button>

                <div className="min-w-[220px]">
                  <Label className="mb-1 block text-sm">
                    {t("fields.warehouse")}
                  </Label>
                  <MultiSelect
                    value={filters.warehouseIds ?? []}
                    onValueChange={(values) =>
                      setFilters({
                        warehouseIds: values.length > 0 ? values : undefined,
                        page: 1,
                      })
                    }
                    options={warehouseOptions}
                    allLabel={t("filters.allWarehouses")}
                    selectedLabel={t("fields.warehouse")}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          {isLoading ? (
            <StockTableSkeleton />
          ) : !data?.data.length ? (
            <EmptyState />
          ) : (
            <>
              <StockSummaryCards items={data.data} />

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200 text-left text-sm font-medium text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                      <SortableHeader
                        label={t("fields.product")}
                        field="productName"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                        className="px-4 py-3"
                      />
                      <SortableHeader
                        label={t("fields.warehouse")}
                        field="warehouseName"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                        className="px-4 py-3"
                      />
                      <SortableHeader
                        label={t("fields.quantity")}
                        field="quantity"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                        className="px-4 py-3 text-right"
                      />
                      <SortableHeader
                        label={t("fields.avgCost")}
                        field="averageCost"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                        className="px-4 py-3 text-right"
                      />
                      <SortableHeader
                        label={t("fields.totalValue")}
                        field="totalValue"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                        className="px-4 py-3 text-right"
                      />
                      <SortableHeader
                        label={t("fields.lastMovement")}
                        field="lastMovementAt"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                        className="px-4 py-3"
                      />
                      <th className="px-4 py-3">{t("fields.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(sortedData ?? data?.data ?? []).map((stock) => (
                      <StockRow
                        key={stock.id}
                        stock={stock}
                        onSetRule={handleSetRule}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {selectedStock && (
        <ReorderRuleDialog
          open={ruleDialogOpen}
          onOpenChange={setRuleDialogOpen}
          productId={selectedStock.productId}
          warehouseId={selectedStock.warehouseId}
          productName={selectedStock.productName || selectedStock.productId}
          warehouseName={
            selectedStock.warehouseName || selectedStock.warehouseId
          }
        />
      )}
    </>
  );
}
