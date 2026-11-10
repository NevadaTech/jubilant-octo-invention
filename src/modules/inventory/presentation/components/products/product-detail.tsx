"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Loader2, Pencil, Plus, Warehouse } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { PageHeader } from "@/ui/layout/page-header";
import { CatalogStatus, catalogTextAction } from "./catalog-chrome";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
import {
  useProduct,
  useToggleProductStatus,
} from "@/modules/inventory/presentation/hooks/use-products";
import { useReorderRules } from "@/modules/inventory/presentation/hooks/use-reorder-rules";
import { useWarehouses } from "@/modules/inventory/presentation/hooks/use-warehouses";
import { formatDate } from "@/lib/date";
import { ReorderRuleDialog } from "@/modules/inventory/presentation/components/stock/reorder-rule-dialog";
import { ProductReferencePhoto } from "./product-reference-photo";
import type { Warehouse as WarehouseEntity } from "@/modules/inventory/domain/entities/warehouse.entity";

interface ProductDetailProps {
  productId: string;
}

function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function Fact({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1 rounded-xl border border-border bg-card px-3.5 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function FactRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
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
          // eslint-disable-next-line @eslint-react/no-array-index-key
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
  const locale = useLocale();
  const { data: product, isLoading, isError, error } = useProduct(productId);
  const toggleStatus = useToggleProductStatus();
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const lowStock = product.isActive && minStock > 0 && totalStock <= minStock;
  const statusTone = !product.isActive
    ? "muted"
    : lowStock
      ? "warning"
      : "success";
  const statusLabel = !product.isActive
    ? t("status.inactive")
    : lowStock
      ? t("status.lowStock")
      : t("status.active");

  return (
    <div className="space-y-4">
      <PageHeader
        title={product.name}
        description={[product.sku, product.companyName].filter(Boolean).join(" · ")}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href={`/dashboard/inventory/products/${productId}/edit`}>
                {tCommon("edit")}
              </Link>
            </Button>
            <Button
              variant="outline"
              className={product.isActive ? "text-destructive" : undefined}
              onClick={() => setConfirmOpen(true)}
              disabled={toggleStatus.isPending}
            >
              {toggleStatus.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {product.isActive ? t("actions.deactivate") : t("actions.activate")}
            </Button>
          </div>
        }
      />
      <CatalogStatus tone={statusTone}>{statusLabel}</CatalogStatus>

      <ProductReferencePhoto
        productId={product.id}
        productName={product.name}
        imageUrl={product.imageUrl}
      />

      {/* Confirmation dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="shadow-none">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {product.isActive
                ? t("confirm.deactivate.title")
                : t("confirm.activate.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {product.isActive
                ? t("confirm.deactivate.description")
                : t("confirm.activate.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={toggleStatus.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className={
                product.isActive
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
              onClick={() => {
                toggleStatus.mutate({
                  id: product.id,
                  isActive: !product.isActive,
                });
                setConfirmOpen(false);
              }}
              disabled={toggleStatus.isPending}
            >
              {toggleStatus.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {product.isActive
                ? t("actions.deactivate")
                : t("actions.activate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {product.description ? (
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">
            {t("detail.description")}
          </h2>
          <p className="mt-2 text-sm text-foreground">{product.description}</p>
        </section>
      ) : null}

      {!product.isActive &&
      (product.statusChangedBy || product.statusChangedAt) ? (
        <section className="space-y-3 rounded-xl border border-warning-200 bg-warning-100/40 p-4">
          <h2 className="text-sm font-semibold text-warning-700">
            {t("detail.statusInfo")}
          </h2>
          <dl className="space-y-2">
            {product.statusChangedBy ? (
              <FactRow
                label={t("detail.statusChangedBy")}
                value={product.statusChangedBy}
              />
            ) : null}
            {product.statusChangedAt ? (
              <FactRow
                label={t("detail.statusChangedAt")}
                value={formatDate(product.statusChangedAt, locale)}
              />
            ) : null}
          </dl>
        </section>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Fact label={t("fields.price")} value={formatCurrency(product.price)} />
        <Fact label={t("fields.cost")} value={formatCurrency(averageCost)} />
        <Fact
          label={t("detail.margin")}
          value={
            <span className={marginColor}>
              {margin > 0 ? "+" : ""}
              {margin}%
            </span>
          }
        />
        <Fact label={t("detail.profit")} value={formatCurrency(profit)} />
        <Fact label={t("detail.totalStock")} value={totalStock.toLocaleString()} />
        <Fact
          label={t("fields.minStock")}
          value={minStock > 0 ? minStock.toString() : "—"}
        />
        <Fact
          label={t("fields.maxStock")}
          value={maxStock > 0 ? maxStock.toString() : "—"}
        />
        <Fact
          label={t("detail.safetyStock")}
          value={safetyStock > 0 ? safetyStock.toString() : "—"}
        />
        <Fact label={t("fields.unitOfMeasure")} value={product.unitOfMeasure} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">
            {t("detail.classification")}
          </h2>
          <dl className="space-y-3">
            <FactRow
              label={t("fields.category")}
              value={
                product.categories.length > 0 ? (
                  <span className="flex flex-wrap justify-end gap-1">
                    {product.categories.map((category) => (
                      <span key={category.id}>{category.name}</span>
                    ))}
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <FactRow label={t("fields.brand")} value={product.brandName || "—"} />
            <FactRow
              label={t("fields.barcode")}
              value={
                product.barcode ? (
                  <span className="font-mono tracking-wider">{product.barcode}</span>
                ) : (
                  "—"
                )
              }
            />
            <FactRow
              label={t("detail.createdAt")}
              value={formatDate(product.createdAt, locale)}
            />
            <FactRow
              label={t("detail.updatedAt")}
              value={formatDate(product.updatedAt, locale)}
            />
          </dl>
        </section>

        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">
            {t("detail.rotation")}
          </h2>
          <dl className="space-y-3">
            <FactRow
              label={t("detail.totalIn30d")}
              value={totalIn30d.toLocaleString()}
            />
            <FactRow
              label={t("detail.totalOut30d")}
              value={totalOut30d.toLocaleString()}
            />
            <FactRow
              label={t("detail.avgDailyConsumption")}
              value={avgDailyConsumption.toLocaleString()}
            />
            <FactRow
              label={t("detail.daysOfStock")}
              value={
                daysOfStock !== null
                  ? t("detail.daysUnit", { days: daysOfStock })
                  : "—"
              }
            />
            <FactRow
              label={t("detail.turnoverRate")}
              value={
                turnoverRate > 0
                  ? t("detail.timesPerYear", { rate: turnoverRate })
                  : "—"
              }
            />
            <FactRow
              label={t("detail.lastMovementDate")}
              value={
                lastMovementDate
                  ? formatDate(lastMovementDate, locale)
                  : t("detail.noMovements")
              }
            />
          </dl>
        </section>
      </div>

      <ProductReorderRules productId={productId} productName={product.name} />

      <Link href="/dashboard/inventory/products" className={catalogTextAction}>
        {t("detail.backToList")}
      </Link>
    </div>
  );
}

/* ─── Reorder Rules sub-component ─── */

interface ProductReorderRulesProps {
  productId: string;
  productName: string;
}

function ProductReorderRules({
  productId,
  productName,
}: ProductReorderRulesProps) {
  const t = useTranslations("inventory.products");
  const tRule = useTranslations("inventory.stock.reorderRule");
  const { data: allRules, isLoading: rulesLoading } = useReorderRules();
  const { data: warehousesResult } = useWarehouses();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(
    null,
  );

  const warehouses = warehousesResult?.data ?? [];
  const productRules = (allRules ?? []).filter(
    (r) => r.productId === productId,
  );

  // Build a warehouse name lookup
  const warehouseNameMap = new Map<string, string>();
  for (const w of warehouses) {
    warehouseNameMap.set(w.id, w.name);
  }

  // Warehouses that don't have a rule yet
  const usedWarehouseIds = new Set(productRules.map((r) => r.warehouseId));
  const availableWarehouses = warehouses.filter(
    (w) => !usedWarehouseIds.has(w.id),
  );

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
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">{t("detail.reorderRules")}</CardTitle>
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
              {/* eslint-disable @eslint-react/no-array-index-key */}
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"
                />
              ))}
              {/* eslint-enable @eslint-react/no-array-index-key */}
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
                        {warehouseNameMap.get(rule.warehouseId) ??
                          rule.warehouseId}
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
          warehouseName={
            warehouseNameMap.get(selectedWarehouseId) ?? selectedWarehouseId
          }
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
