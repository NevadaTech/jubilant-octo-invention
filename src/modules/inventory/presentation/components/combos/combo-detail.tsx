"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Layers,
  Edit,
  ArrowLeft,
  Tag,
  DollarSign,
  Calendar,
  Ban,
  Loader2,
  Warehouse,
} from "lucide-react";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";
import { ConfirmDeleteDialog } from "@/ui/components/confirm-delete-dialog";
import { PermissionGate } from "@/shared/presentation/components/permission-gate";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  useCombo,
  useDeactivateCombo,
  useComboAvailability,
} from "@/modules/inventory/presentation/hooks/use-combos";
import { useProducts } from "@/modules/inventory/presentation/hooks/use-products";
import { formatDate } from "@/lib/date";

interface ComboDetailProps {
  comboId: string;
}

function formatCurrency(amount: number, currency = "COP"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
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
        <div className="font-medium text-neutral-900 dark:text-neutral-100">
          {value}
        </div>
      </div>
    </div>
  );
}

function ComboDetailSkeleton() {
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
        {/* eslint-disable @eslint-react/no-array-index-key */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            </div>
          </div>
        ))}
        {/* eslint-enable @eslint-react/no-array-index-key */}
      </div>
    </div>
  );
}

export function ComboDetail({ comboId }: ComboDetailProps) {
  const t = useTranslations("inventory.combos");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { data: combo, isLoading, isError, error } = useCombo(comboId);
  const deactivateCombo = useDeactivateCombo();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Load products to resolve names
  const { data: productsData } = useProducts({ limit: 200 });
  const productMap = useMemo(() => {
    const map = new Map<string, { name: string; sku: string }>();
    if (productsData?.data) {
      for (const p of productsData.data) {
        map.set(p.id, { name: p.name, sku: p.sku });
      }
    }
    return map;
  }, [productsData]);

  // Load availability for this combo's SKU
  const { data: availabilityData, isLoading: isLoadingAvailability } =
    useComboAvailability(combo ? { sku: combo.sku, limit: 50 } : undefined);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <ComboDetailSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (isError || !combo) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Layers className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
            <p className="text-destructive">
              {error?.message || t("detail.notFound")}
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/dashboard/inventory/combos">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("detail.backToList")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const comboAvailability = availabilityData?.data?.find(
    (a) => a.sku === combo.sku,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/inventory/combos">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <Layers className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {combo.name}
            </h1>
            <p className="text-sm text-muted-foreground">{combo.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={combo.isActive ? "success" : "secondary"}>
            {combo.isActive ? t("status.active") : t("status.inactive")}
          </Badge>
          <PermissionGate permission={PERMISSIONS.COMBOS_DELETE}>
            {combo.isActive && (
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(true)}
                disabled={deactivateCombo.isPending}
              >
                {deactivateCombo.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Ban className="mr-2 h-4 w-4" />
                )}
                {t("actions.deactivate")}
              </Button>
            )}
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.COMBOS_UPDATE}>
            <Button asChild>
              <Link href={`/dashboard/inventory/combos/${comboId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                {tCommon("edit")}
              </Link>
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Description */}
      {combo.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("detail.description")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 dark:text-neutral-300">
              {combo.description}
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
              value={formatCurrency(combo.price, combo.currency)}
            />
            <DetailItem
              icon={Tag}
              label={t("fields.currency")}
              value={combo.currency}
            />
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("detail.dates")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem
              icon={Calendar}
              label={t("detail.createdAt")}
              value={formatDate(combo.createdAt, locale)}
            />
            <DetailItem
              icon={Calendar}
              label={t("detail.updatedAt")}
              value={formatDate(combo.updatedAt, locale)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("detail.items")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm font-medium text-muted-foreground">
                  <th className="px-4 py-3">{t("fields.productName")}</th>
                  <th className="px-4 py-3">{t("fields.productSku")}</th>
                  <th className="px-4 py-3">{t("fields.quantity")}</th>
                </tr>
              </thead>
              <tbody>
                {combo.items.map((item) => {
                  const product = productMap.get(item.productId);
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-neutral-200 dark:border-neutral-700"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {product?.name || item.productId}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {product?.sku || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {item.quantity}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Availability Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("detail.availability")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAvailability ? (
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
          ) : comboAvailability?.availability?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm font-medium text-muted-foreground">
                    <th className="px-4 py-3">{t("fields.warehouse")}</th>
                    <th className="px-4 py-3">{t("fields.available")}</th>
                  </tr>
                </thead>
                <tbody>
                  {comboAvailability.availability.map((wh) => (
                    <tr
                      key={wh.warehouseId}
                      className="border-b border-neutral-200 dark:border-neutral-700"
                    >
                      <td className="px-4 py-3 text-sm text-foreground">
                        <div className="flex items-center gap-2">
                          <Warehouse className="h-4 w-4 text-neutral-400" />
                          {wh.warehouseName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            wh.available > 0
                              ? "font-medium text-success-600 dark:text-success-400"
                              : "font-medium text-destructive"
                          }
                        >
                          {wh.available}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("detail.noAvailability")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Deactivate Confirmation */}
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => {
          deactivateCombo.mutate(comboId);
          setConfirmOpen(false);
        }}
        title={t("confirm.deactivate.title")}
        description={t("confirm.deactivate.description")}
        isLoading={deactivateCombo.isPending}
      />
    </div>
  );
}
