"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Card, CardContent } from "@/ui/components/card";
import { PageHeader } from "@/ui/layout/page-header";
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
import { PermissionGate } from "@/shared/presentation/components/permission-gate";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  useCombo,
  useDeactivateCombo,
  useComboAvailability,
} from "@/modules/inventory/presentation/hooks/use-combos";
import {
  CatalogStatus,
  catalogPanel,
  catalogTextAction,
} from "../products/catalog-chrome";
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
            <p className="text-destructive">
              {error?.message || t("detail.notFound")}
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/dashboard/inventory/combos">
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

  const availableTotal = comboAvailability?.availability?.reduce(
    (sum, row) => sum + row.available,
    0,
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title={combo.name}
        description={combo.sku}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <PermissionGate permission={PERMISSIONS.COMBOS_UPDATE}>
              <Button asChild variant="outline">
                <Link href={`/dashboard/inventory/combos/${comboId}/edit`}>
                  {tCommon("edit")}
                </Link>
              </Button>
            </PermissionGate>
            <PermissionGate permission={PERMISSIONS.COMBOS_DELETE}>
              {combo.isActive ? (
                <Button
                  variant="outline"
                  className="text-destructive"
                  onClick={() => setConfirmOpen(true)}
                  disabled={deactivateCombo.isPending}
                >
                  {deactivateCombo.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t("actions.deactivate")}
                </Button>
              ) : null}
            </PermissionGate>
          </div>
        }
      />
      <CatalogStatus tone={combo.isActive ? "success" : "muted"}>
        {combo.isActive ? t("status.active") : t("status.inactive")}
      </CatalogStatus>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <p>
          <span>{t("fields.price")}</span>{" "}
          <span>{formatCurrency(combo.price, combo.currency)}</span>
        </p>
        {availableTotal !== undefined ? (
          <p>
            <span>{t("fields.available")}</span> <span>{availableTotal}</span>
          </p>
        ) : null}
      </div>

      {combo.description ? (
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">
            {t("detail.description")}
          </h2>
          <p className="mt-2 text-sm text-foreground">{combo.description}</p>
        </section>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">{t("detail.pricing")}</h2>
          <dl className="space-y-3">
            <FactRow
              label={t("fields.price")}
              value={formatCurrency(combo.price, combo.currency)}
            />
            <FactRow label={t("fields.currency")} value={combo.currency} />
          </dl>
        </section>
        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">{t("detail.dates")}</h2>
          <dl className="space-y-3">
            <FactRow
              label={t("detail.createdAt")}
              value={formatDate(combo.createdAt, locale)}
            />
            <FactRow
              label={t("detail.updatedAt")}
              value={formatDate(combo.updatedAt, locale)}
            />
          </dl>
        </section>
      </div>

      <section className={`${catalogPanel} p-4`}>
        <h2 className="text-sm font-semibold text-foreground">{t("detail.items")}</h2>
        <ul className="mt-3 divide-y divide-border">
          {combo.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {item.productName || item.productId}
                </p>
                <p className="font-mono text-sm text-muted-foreground">
                  {item.productSku || "—"}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                <span>{t("fields.quantity")}</span>{" "}
                <span>{item.quantity}</span>
              </p>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">{t("detail.stockLimit")}</p>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">{t("detail.availability")}</h2>
        {isLoadingAvailability ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div
                // eslint-disable-next-line @eslint-react/no-array-index-key
                key={i}
                className="h-12 animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        ) : comboAvailability?.availability?.length ? (
          <ul className="divide-y divide-border">
            {comboAvailability.availability.map((wh) => (
              <li key={wh.warehouseId} className="flex items-center justify-between py-3">
                <span className="text-sm text-foreground">{wh.warehouseName}</span>
                <CatalogStatus tone={wh.available > 0 ? "success" : "danger"}>
                  {wh.available}
                </CatalogStatus>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t("detail.noAvailability")}</p>
        )}
      </section>

      <Link href="/dashboard/inventory/combos" className={catalogTextAction}>
        {t("detail.backToList")}
      </Link>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="shadow-none">
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle>{t("confirm.deactivate.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirm.deactivate.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateCombo.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deactivateCombo.isPending}
              onClick={(event) => {
                event.preventDefault();
                deactivateCombo.mutate(comboId);
                setConfirmOpen(false);
              }}
            >
              {t("actions.deactivate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
