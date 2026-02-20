"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Package,
  Edit,
  ArrowLeft,
  Tag,
  DollarSign,
  BarChart3,
  Calendar,
  Layers,
  TrendingUp,
  ShieldCheck,
  Warehouse,
  RefreshCw,
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  Plus,
  Pencil,
} from "lucide-react";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
import { useProduct } from "../../hooks/use-products";
import { useReorderRules } from "../../hooks/use-reorder-rules";
import { useWarehouses } from "../../hooks/use-warehouses";
import { ReorderRuleDialog } from "../stock/reorder-rule-dialog";
import type { Warehouse as WarehouseEntity } from "../../../domain/entities/warehouse.entity";

interface ProductDetailProps {
  productId: string;
}

function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
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
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
        <div className="font-medium text-neutral-900 dark:text-neutral-100">
          {value}
        </div>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
        <div className="space-y-2">
          <div className="h-6 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const t = useTranslations("inventory.products");
  const tCommon = useTranslations("common");
  const { data: product, isLoading, isError, error } = useProduct(productId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <ProductDetailSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (isError || !product) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
            <p className="text-destructive">
              {error?.message || t("detail.notFound")}
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/dashboard/inventory/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("detail.backToList")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const margin = product.margin ?? 0;
  const averageCost = product.averageCost ?? 0;
  const profit = product.profit ?? 0;
  const totalStock = product.totalStock ?? 0;
  const minStock = product.minStock ?? 0;
  const maxStock = product.maxStock ?? 0;
  const safetyStock = product.safetyStock ?? 0;
  // Rotation metrics
  const totalIn30d = product.totalIn30d ?? 0;
  const totalOut30d = product.totalOut30d ?? 0;
  const avgDailyConsumption = product.avgDailyConsumption ?? 0;
  const daysOfStock = product.daysOfStock ?? null;
  const turnoverRate = product.turnoverRate ?? 0;
  const lastMovementDate = product.lastMovementDate;

  const marginColor =
    margin > 0
      ? "text-success-600 dark:text-success-400"
      : margin < 0
        ? "text-destructive"
        : "text-neutral-600 dark:text-neutral-300";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/inventory/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <Package className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {product.name}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              {product.sku}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={product.isActive ? "success" : "secondary"}>
            {product.isActive ? t("status.active") : t("status.inactive")}
          </Badge>
          <Button asChild>
            <Link href={`/dashboard/inventory/products/${productId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              {tCommon("edit")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("detail.description")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 dark:text-neutral-300">
              {product.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("detail.pricing")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem
              icon={DollarSign}
              label={t("fields.price")}
              value={formatCurrency(product.price)}
            />
            <DetailItem
              icon={DollarSign}
              label={t("fields.cost")}
              value={formatCurrency(averageCost)}
            />
            <DetailItem
              icon={TrendingUp}
              label={t("detail.margin")}
              value={
                <span className={marginColor}>
                  {margin > 0 ? "+" : ""}
                  {margin}%
                </span>
              }
            />
            <DetailItem
              icon={BarChart3}
              label={t("detail.profit")}
              value={formatCurrency(profit)}
            />
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("detail.inventory")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem
              icon={Layers}
              label={t("fields.unitOfMeasure")}
              value={product.unitOfMeasure}
            />
            <DetailItem
              icon={Warehouse}
              label={t("detail.totalStock")}
              value={totalStock.toLocaleString()}
            />
            <DetailItem
              icon={BarChart3}
              label={t("fields.minStock")}
              value={minStock > 0 ? minStock.toString() : "-"}
            />
            <DetailItem
              icon={BarChart3}
              label={t("fields.maxStock")}
              value={maxStock > 0 ? maxStock.toString() : "-"}
            />
            <DetailItem
              icon={ShieldCheck}
              label={t("detail.safetyStock")}
              value={safetyStock > 0 ? safetyStock.toString() : "-"}
            />
          </CardContent>
        </Card>

        {/* Classification & Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("detail.classification")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem
              icon={Tag}
              label={t("fields.category")}
              value={
                product.categories.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {product.categories.map((c) => (
                      <Badge key={c.id} variant="outline" className="text-xs">
                        {c.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  "—"
                )
              }
            />
            <DetailItem
              icon={Calendar}
              label={t("detail.createdAt")}
              value={formatDate(product.createdAt)}
            />
            <DetailItem
              icon={Calendar}
              label={t("detail.updatedAt")}
              value={formatDate(product.updatedAt)}
            />
          </CardContent>
        </Card>

        {/* Rotation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("detail.rotation")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem
              icon={ArrowDownToLine}
              label={t("detail.totalIn30d")}
              value={totalIn30d.toLocaleString()}
            />
            <DetailItem
              icon={ArrowUpFromLine}
              label={t("detail.totalOut30d")}
              value={totalOut30d.toLocaleString()}
            />
            <DetailItem
              icon={BarChart3}
              label={t("detail.avgDailyConsumption")}
              value={avgDailyConsumption.toLocaleString()}
            />
            <DetailItem
              icon={Layers}
              label={t("detail.daysOfStock")}
              value={
                daysOfStock !== null
                  ? t("detail.daysUnit", { days: daysOfStock })
                  : "-"
              }
            />
            <DetailItem
              icon={RefreshCw}
              label={t("detail.turnoverRate")}
              value={
                turnoverRate > 0
                  ? t("detail.timesPerYear", { rate: turnoverRate })
                  : "-"
              }
            />
            <DetailItem
              icon={Clock}
              label={t("detail.lastMovementDate")}
              value={
                lastMovementDate
                  ? formatDate(new Date(lastMovementDate))
                  : t("detail.noMovements")
              }
            />
          </CardContent>
        </Card>

      </div>

      {/* Reorder Rules */}
      <ProductReorderRules productId={productId} productName={product.name} />
    </div>
  );
}

/* ─── Reorder Rules sub-component ─── */

interface ProductReorderRulesProps {
  productId: string;
  productName: string;
}

function ProductReorderRules({ productId, productName }: ProductReorderRulesProps) {
  const t = useTranslations("inventory.products");
  const tRule = useTranslations("inventory.stock.reorderRule");
  const { data: allRules, isLoading: rulesLoading } = useReorderRules();
  const { data: warehousesResult } = useWarehouses();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);

  const warehouses = warehousesResult?.data ?? [];
  const productRules = (allRules ?? []).filter((r) => r.productId === productId);

  // Build a warehouse name lookup
  const warehouseNameMap = new Map<string, string>();
  for (const w of warehouses) {
    warehouseNameMap.set(w.id, w.name);
  }

  // Warehouses that don't have a rule yet
  const usedWarehouseIds = new Set(productRules.map((r) => r.warehouseId));
  const availableWarehouses = warehouses.filter((w) => !usedWarehouseIds.has(w.id));

  const handleAddRule = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    setDialogOpen(true);
  };

  const handleEditRule = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">{t("detail.reorderRules")}</CardTitle>
          {availableWarehouses.length > 0 && (
            <WarehouseAddDropdown
              warehouses={availableWarehouses}
              onSelect={handleAddRule}
            />
          )}
        </CardHeader>
        <CardContent>
          {rulesLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              ))}
            </div>
          ) : productRules.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("detail.noReorderRules")}
            </p>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {productRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <Warehouse className="h-4 w-4 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {warehouseNameMap.get(rule.warehouseId) ?? rule.warehouseId}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {tRule("fields.minQty")}: {rule.minQty} &middot;{" "}
                        {tRule("fields.maxQty")}: {rule.maxQty} &middot;{" "}
                        {tRule("fields.safetyQty")}: {rule.safetyQty}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditRule(rule.warehouseId)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedWarehouseId && (
        <ReorderRuleDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          productId={productId}
          warehouseId={selectedWarehouseId}
          productName={productName}
          warehouseName={warehouseNameMap.get(selectedWarehouseId) ?? selectedWarehouseId}
        />
      )}
    </>
  );
}

/* ─── Add rule dropdown (warehouse picker) ─── */

function WarehouseAddDropdown({
  warehouses,
  onSelect,
}: {
  warehouses: WarehouseEntity[];
  onSelect: (warehouseId: string) => void;
}) {
  const tRule = useTranslations("inventory.stock.reorderRule");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {tRule("create")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {warehouses.map((w) => (
          <DropdownMenuItem key={w.id} onClick={() => onSelect(w.id)}>
            <Warehouse className="mr-2 h-4 w-4" />
            {w.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
