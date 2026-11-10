"use client";

import { useState, useMemo } from "react";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";
import { useTranslations } from "next-intl";
import { Package, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { Badge } from "@/ui/components/badge";
import { SortableHeader } from "@/ui/components/sortable-header";
import { MultiSelect } from "@/ui/components/multi-select";
import { PageHeader } from "@/ui/layout/page-header";
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

const rowClass =
  "flex flex-col gap-1 rounded-xl border border-border bg-card p-3.5 lg:table-row lg:rounded-none lg:border-0 lg:border-b lg:border-border lg:bg-transparent lg:p-0";
const cellClass = "px-0 py-0 text-sm text-foreground lg:px-3 lg:py-3";

function stockStatus(stock: Stock): {
  label: "status.out" | "status.low" | "status.active";
  variant: "error" | "warning" | "success";
} {
  if (stock.isOutOfStock) return { label: "status.out", variant: "error" };
  if (stock.availableQuantity <= 10) {
    return { label: "status.low", variant: "warning" };
  }
  return { label: "status.active", variant: "success" };
}

function StockRow({
  stock,
  onSetRule,
}: {
  stock: Stock;
  onSetRule: (stock: Stock) => void;
}) {
  const t = useTranslations("inventory.stock");
  const isLowStock = stock.availableQuantity <= 10 && stock.availableQuantity > 0;
  const status = stockStatus(stock);

  return (
    <tr className={rowClass}>
      <td className={cellClass}>
        <p className="font-semibold text-foreground">
          {stock.productName || stock.productId}
        </p>
        {(stock.productSku || stock.productBarcode) && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-muted-foreground">
            {stock.productSku ? <span>{stock.productSku}</span> : null}
            {stock.productSku && stock.productBarcode ? (
              <span aria-hidden="true" className="text-muted-foreground">
                &middot;
              </span>
            ) : null}
            {stock.productBarcode ? (
              <span
                className="font-mono text-xs tracking-wider tabular-nums"
                aria-label={t("fields.barcode")}
              >
                {stock.productBarcode}
              </span>
            ) : null}
          </p>
        )}
      </td>
      <td className={cellClass}>{stock.warehouseName || stock.warehouseId}</td>
      <td className={cellClass}>
        <span className={isLowStock ? "font-medium text-warning-500" : "font-medium"}>
          {stock.availableQuantity}
        </span>
      </td>
      <td className={cellClass}>{stock.reservedQuantity}</td>
      <td className={cellClass}>
        <button
          type="button"
          className="text-sm font-semibold text-primary"
          onClick={() => onSetRule(stock)}
        >
          {t("actions.setRule")}
        </button>
      </td>
      <td className={cellClass}>
        <Badge
          variant={status.variant}
          className="rounded-full px-2 py-0.5 text-xs font-semibold"
        >
          {t(status.label)}
        </Badge>
      </td>
      <td className={`${cellClass} text-muted-foreground`}>
        {stock.lastMovementAt
          ? new Date(stock.lastMovementAt).toLocaleDateString()
          : "-"}
      </td>
    </tr>
  );
}

function StockTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* eslint-disable @eslint-react/no-array-index-key */}
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
      {/* eslint-enable @eslint-react/no-array-index-key */}
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
    },
    {
      label: t("summary.totalQuantity"),
      value: totalQuantity.toLocaleString(),
    },
    {
      label: t("summary.totalValue"),
      value: formatCurrency(totalValue, currency),
    },
    {
      label: t("summary.lowStockItems"),
      value: lowStockCount.toLocaleString(),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border bg-card p-3.5"
        >
          <p className="text-xs text-muted-foreground">{card.label}</p>
          <p className="text-xl font-bold text-foreground">{card.value}</p>
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
  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);
  const filtersWithCompany = useMemo(
    () =>
      selectedCompanyId
        ? { ...filters, companyId: selectedCompanyId }
        : filters,
    [filters, selectedCompanyId],
  );
  const { data, isLoading, isError, error } = useStock(filtersWithCompany);

  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [sortBy, setSortBy] = useState<StockFilters["sortBy"]>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>();

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
      <div className="rounded-xl border border-border bg-card px-4 py-8 text-center text-destructive">
        {t("error.loading")}: {error?.message}
      </div>
    );
  }

  const rows = sortedData ?? data?.data ?? [];

  const exportCsv = () => {
    const header = [
      t("fields.product"),
      t("fields.warehouse"),
      t("fields.available"),
      t("fields.reserved"),
      t("fields.minimum"),
      t("fields.status"),
    ];
    const body = rows.map((stock) => {
      const status = stockStatus(stock);
      return [
        stock.productName || stock.productId,
        stock.warehouseName || stock.warehouseId,
        String(stock.availableQuantity),
        String(stock.reservedQuantity),
        "",
        t(status.label),
      ];
    });
    const csv = [header, ...body]
      .map((line) =>
        line.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "stock.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="space-y-4">
        <PageHeader
          title={t("title")}
          description={t("description")}
          action={
            <Button type="button" onClick={exportCsv} disabled={!rows.length}>
              {tCommon("export")}
            </Button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              {tCommon("search")}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("search.placeholder")}
                className="h-10 pl-9"
                value={filters.search || ""}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-semibold text-muted-foreground">
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
          <div className="flex flex-col justify-end gap-1">
            <Button
              variant={filters.lowStock ? "default" : "outline"}
              onClick={() =>
                setFilters({ lowStock: !filters.lowStock, page: 1 })
              }
              className="h-10 gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              {t("filters.lowStock")}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <StockTableSkeleton />
        ) : !data?.data.length ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            <StockSummaryCards items={data.data} />
            <div className="lg:overflow-hidden lg:rounded-xl lg:border lg:border-border lg:bg-card">
              <table className="w-full">
                <thead className="hidden bg-muted/70 text-xs font-semibold text-muted-foreground lg:table-header-group">
                  <tr className="h-10 text-left">
                    <SortableHeader
                      label={t("fields.product")}
                      field="productName"
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                      className="px-3"
                    />
                    <SortableHeader
                      label={t("fields.warehouse")}
                      field="warehouseName"
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                      className="px-3"
                    />
                    <SortableHeader
                      label={t("fields.available")}
                      field="availableQuantity"
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                      className="px-3"
                    />
                    <SortableHeader
                      label={t("fields.reserved")}
                      field="reservedQuantity"
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                      className="px-3"
                    />
                    <th className="px-3">{t("fields.minimum")}</th>
                    <th className="px-3">{t("fields.status")}</th>
                    <SortableHeader
                      label={t("fields.lastMovement")}
                      field="lastMovementAt"
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                      className="px-3"
                    />
                  </tr>
                </thead>
                <tbody className="flex flex-col gap-3 lg:table-row-group">
                  {rows.map((stock) => (
                    <StockRow
                      key={stock.id}
                      stock={stock}
                      onSetRule={handleSetRule}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

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
