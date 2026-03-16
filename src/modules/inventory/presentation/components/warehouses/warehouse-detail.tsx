"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Warehouse as WarehouseIcon,
  Edit,
  ArrowLeft,
  MapPin,
  Calendar,
  Package,
  Search,
  DollarSign,
  Boxes,
  ToggleLeft,
  ToggleRight,
  User,
} from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { SortableHeader } from "@/ui/components/sortable-header";
import { Badge } from "@/ui/components/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/components/alert-dialog";
import { formatDate } from "@/lib/date";
import {
  useWarehouse,
  useToggleWarehouseStatus,
} from "@/modules/inventory/presentation/hooks/use-warehouses";
import { useStock } from "@/modules/inventory/presentation/hooks/use-stock";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";
import { useState, useMemo } from "react";

interface WarehouseDetailProps {
  warehouseId: string;
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
        <Icon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
      </div>
      <div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
        <p className="font-medium text-neutral-900 dark:text-neutral-100">
          {value}
        </p>
      </div>
    </div>
  );
}

function WarehouseDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
        <div className="space-y-2">
          <div className="h-6 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
      </div>
    </div>
  );
}

export function WarehouseDetail({ warehouseId }: WarehouseDetailProps) {
  const t = useTranslations("inventory.warehouses");
  const tStock = useTranslations("inventory.stock");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>();
  const toggleStatus = useToggleWarehouseStatus();
  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);

  const {
    data: warehouse,
    isLoading,
    isError,
    error,
  } = useWarehouse(warehouseId);

  const stockFilters = useMemo(
    () => ({
      warehouseIds: [warehouseId],
      search: search || undefined,
      limit: 100,
      ...(selectedCompanyId ? { companyId: selectedCompanyId } : {}),
    }),
    [warehouseId, search, selectedCompanyId],
  );

  const { data: stockData, isLoading: isLoadingStock } = useStock(stockFilters);

  const warehouseMetrics = useMemo(() => {
    if (!stockData?.data.length)
      return { totalQuantity: 0, totalValue: 0, currency: "USD" };
    const totalQuantity = stockData.data.reduce(
      (sum, s) => sum + s.quantity,
      0,
    );
    const totalValue = stockData.data.reduce((sum, s) => sum + s.totalValue, 0);
    const currency = stockData.data.find((s) => s.currency)?.currency || "USD";
    return { totalQuantity, totalValue, currency };
  }, [stockData]);

  const handleSort = (field: string, order: "asc" | "desc" | undefined) => {
    setSortBy(order ? field : undefined);
    setSortOrder(order);
  };

  const sortedStock = useMemo(() => {
    if (!stockData?.data || !sortBy) return stockData?.data;
    const items = [...stockData.data];
    const dir = sortOrder === "desc" ? -1 : 1;
    return items.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      switch (sortBy) {
        case "productName":
          aVal = (a.productName || "").toLowerCase();
          bVal = (b.productName || "").toLowerCase();
          return aVal.localeCompare(bVal) * dir;
        case "quantity":
          aVal = a.quantity;
          bVal = b.quantity;
          break;
        case "averageCost":
          aVal = a.averageCost;
          bVal = b.averageCost;
          break;
        case "totalValue":
          aVal = a.totalValue;
          bVal = b.totalValue;
          break;
        case "availableQuantity":
          aVal = a.availableQuantity;
          bVal = b.availableQuantity;
          break;
        default:
          return 0;
      }
      return ((aVal as number) - (bVal as number)) * dir;
    });
  }, [stockData?.data, sortBy, sortOrder]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <WarehouseDetailSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (isError || !warehouse) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <WarehouseIcon className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
            <p className="text-destructive">
              {error?.message || t("detail.notFound")}
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/dashboard/inventory/warehouses">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("detail.backToList")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/inventory/warehouses">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <WarehouseIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {warehouse.name}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              {warehouse.code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={warehouse.isActive ? "success" : "secondary"}>
            {warehouse.isActive ? t("status.active") : t("status.inactive")}
          </Badge>
          <Button
            variant="outline"
            onClick={() => setConfirmOpen(true)}
            disabled={toggleStatus.isPending}
          >
            {warehouse.isActive ? (
              <>
                <ToggleRight className="mr-2 h-4 w-4 text-green-600" />
                {t("actions.deactivate")}
              </>
            ) : (
              <>
                <ToggleLeft className="mr-2 h-4 w-4 text-muted-foreground" />
                {t("actions.activate")}
              </>
            )}
          </Button>
          <Button asChild variant="outline">
            <Link href={`/dashboard/inventory/warehouses/${warehouseId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              {tCommon("edit")}
            </Link>
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {warehouse.isActive
                ? t("confirm.deactivate.title")
                : t("confirm.activate.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {warehouse.isActive
                ? t("confirm.deactivate.description")
                : t("confirm.activate.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await toggleStatus.mutateAsync({
                    id: warehouseId,
                    isActive: !warehouse.isActive,
                  });
                } catch {
                  // Error toast handled by hook
                }
              }}
            >
              {tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Info Card (shown when inactive) */}
      {!warehouse.isActive &&
        (warehouse.statusChangedBy || warehouse.statusChangedAt) && (
          <Card className="border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-warning-800 dark:text-warning-200">
                {t("detail.statusInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {warehouse.statusChangedBy && (
                <DetailItem
                  icon={User}
                  label={t("detail.statusChangedBy")}
                  value={warehouse.statusChangedBy}
                />
              )}
              {warehouse.statusChangedAt && (
                <DetailItem
                  icon={Calendar}
                  label={t("detail.statusChangedAt")}
                  value={formatDate(warehouse.statusChangedAt, locale)}
                />
              )}
            </CardContent>
          </Card>
        )}

      {/* Warehouse Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("detail.info")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem
              icon={MapPin}
              label={t("fields.address")}
              value={warehouse.address || "-"}
            />
            <DetailItem
              icon={Calendar}
              label={t("detail.createdAt")}
              value={formatDate(warehouse.createdAt, locale)}
            />
            <DetailItem
              icon={Calendar}
              label={t("detail.updatedAt")}
              value={formatDate(warehouse.updatedAt, locale)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("detail.stats")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem
              icon={Package}
              label={t("detail.totalProducts")}
              value={stockData?.pagination.total.toString() || "0"}
            />
            <DetailItem
              icon={Boxes}
              label={t("detail.totalQuantity")}
              value={warehouseMetrics.totalQuantity.toLocaleString()}
            />
            <DetailItem
              icon={DollarSign}
              label={t("detail.totalValue")}
              value={
                <span className="text-lg font-semibold text-success-600 dark:text-success-400">
                  {formatCurrency(
                    warehouseMetrics.totalValue,
                    warehouseMetrics.currency,
                  )}
                </span>
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Products in Warehouse */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {t("detail.productsInWarehouse")}
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              type="search"
              placeholder={tStock("search.placeholder")}
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingStock ? (
            <div className="space-y-4">
              {/* eslint-disable @eslint-react/no-array-index-key */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
                >
                  <div className="h-10 w-10 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-3 w-1/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                  </div>
                </div>
              ))}
              {/* eslint-enable @eslint-react/no-array-index-key */}
            </div>
          ) : !stockData?.data.length ? (
            <div className="py-8 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
              <p className="text-neutral-500 dark:text-neutral-400">
                {t("detail.noProducts")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-sm font-medium text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                    <SortableHeader
                      label={tStock("fields.product")}
                      field="productName"
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                      className="px-4 py-3"
                    />
                    <SortableHeader
                      label={tStock("fields.quantity")}
                      field="quantity"
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                      className="px-4 py-3 text-right"
                    />
                    <SortableHeader
                      label={tStock("fields.avgCost")}
                      field="averageCost"
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                      className="px-4 py-3 text-right"
                    />
                    <SortableHeader
                      label={tStock("fields.totalValue")}
                      field="totalValue"
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                      className="px-4 py-3 text-right"
                    />
                    <SortableHeader
                      label={tStock("fields.available")}
                      field="availableQuantity"
                      currentSortBy={sortBy}
                      currentSortOrder={sortOrder}
                      onSort={handleSort}
                      className="px-4 py-3 text-right"
                    />
                  </tr>
                </thead>
                <tbody>
                  {(sortedStock ?? stockData.data).map((stock) => (
                    <tr
                      key={stock.id}
                      className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/inventory/products/${stock.productId}`}
                          className="hover:underline"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                              <Package className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                {stock.productName}
                              </p>
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {stock.productSku}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {stock.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-600 dark:text-neutral-300">
                        {formatCurrency(stock.averageCost, stock.currency)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(stock.totalValue, stock.currency)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-medium ${
                            stock.availableQuantity === 0
                              ? "text-destructive"
                              : stock.availableQuantity <= 10
                                ? "text-warning-600 dark:text-warning-400"
                                : "text-success-600 dark:text-success-400"
                          }`}
                        >
                          {stock.availableQuantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
