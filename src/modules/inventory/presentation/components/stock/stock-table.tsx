"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Warehouse,
  Settings2,
} from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { useStock, useStockFilters, useSetStockFilters } from "../../hooks";
import { WarehouseSelector } from "../warehouses/warehouse-selector";
import { ReorderRuleDialog } from "./reorder-rule-dialog";
import type { Stock } from "../../../domain/entities/stock.entity";

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

function StockSummary({ items }: { items: Stock[] }) {
  const t = useTranslations("inventory.stock");
  const totalQuantity = items.reduce((sum, s) => sum + s.quantity, 0);
  const totalValue = items.reduce((sum, s) => sum + s.totalValue, 0);
  const currency = items.find((s) => s.currency)?.currency || "USD";

  return (
    <tr className="border-t-2 border-neutral-300 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800/70">
      <td
        className="px-4 py-3 font-semibold text-neutral-900 dark:text-neutral-100"
        colSpan={2}
      >
        {t("summary.totalQuantity")}
      </td>
      <td className="px-4 py-3 text-right font-semibold text-neutral-900 dark:text-neutral-100">
        {totalQuantity.toLocaleString()}
      </td>
      <td className="px-4 py-3 text-right" />
      <td className="px-4 py-3 text-right font-semibold text-neutral-900 dark:text-neutral-100">
        {formatCurrency(totalValue, currency)}
      </td>
      <td className="px-4 py-3" colSpan={2} />
    </tr>
  );
}

export function StockTable() {
  const t = useTranslations("inventory.stock");
  const filters = useStockFilters();
  const setFilters = useSetStockFilters();
  const { data, isLoading, isError, error } = useStock(filters);

  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

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
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                type="search"
                placeholder={t("search.placeholder")}
                className="pl-9"
                value={filters.search || ""}
                onChange={handleSearch}
              />
            </div>
            <div className="flex items-center gap-3">
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
              <WarehouseSelector />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <StockTableSkeleton />
          ) : !data?.data.length ? (
            <EmptyState />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200 text-left text-sm font-medium text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                      <th className="px-4 py-3">{t("fields.product")}</th>
                      <th className="px-4 py-3">{t("fields.warehouse")}</th>
                      <th className="px-4 py-3 text-right">
                        {t("fields.quantity")}
                      </th>
                      <th className="px-4 py-3 text-right">
                        {t("fields.avgCost")}
                      </th>
                      <th className="px-4 py-3 text-right">
                        {t("fields.totalValue")}
                      </th>
                      <th className="px-4 py-3">{t("fields.lastMovement")}</th>
                      <th className="px-4 py-3">{t("fields.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((stock) => (
                      <StockRow
                        key={stock.id}
                        stock={stock}
                        onSetRule={handleSetRule}
                      />
                    ))}
                    {data.data.length > 0 && <StockSummary items={data.data} />}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.pagination?.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-700">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {t("pagination.showing", {
                      from:
                        (data.pagination.page - 1) * data.pagination.limit + 1,
                      to: Math.min(
                        data.pagination.page * data.pagination.limit,
                        data.pagination.total,
                      ),
                      total: data.pagination.total,
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(data.pagination.page - 1)}
                      disabled={data.pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">
                      {data.pagination.page} / {data.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(data.pagination.page + 1)}
                      disabled={
                        data.pagination.page >= data.pagination.totalPages
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
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
