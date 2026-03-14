"use client";

import { useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatDateTimeMedium } from "@/lib/date";
import {
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle,
  XCircle,
  Package,
  PackageSearch,
  Truck,
  PackageCheck,
  Loader2,
  Undo2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { Skeleton } from "@/ui/components/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/ui/components/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/components/dialog";
import {
  useSale,
  useSaleReturns,
  useConfirmSale,
  useCancelSale,
  useStartPicking,
  useShipSale,
  useCompleteSale,
} from "@/modules/sales/presentation/hooks/use-sales";
import { PermissionGate } from "@/shared/presentation/components/permission-gate";
import { PERMISSIONS } from "@/shared/domain/permissions";
import { SaleStatusBadge } from "./sale-status-badge";
import { SaleTimeline } from "./sale-timeline";
import { SaleSwapDialog } from "./sale-swap-dialog";
import { SaleSwapHistory } from "./sale-swap-history";
import { PickingVerificationCard } from "./picking-verification-card";
import { usePickingConfig } from "@/modules/sales/presentation/hooks/use-picking-config";
import type { SaleLine } from "@/modules/sales/domain/entities/sale.entity";

interface SaleDetailProps {
  saleId: string;
}

export function SaleDetail({ saleId }: SaleDetailProps) {
  const locale = useLocale();
  const t = useTranslations("sales");
  const tCommon = useTranslations("common");
  const tReturns = useTranslations("returns");
  const { data: sale, isLoading, isError } = useSale(saleId);
  const { data: saleReturns } = useSaleReturns(saleId, !!saleId);
  const confirmSale = useConfirmSale();
  const cancelSale = useCancelSale();
  const startPicking = useStartPicking();
  const shipSale = useShipSale();
  const completeSale = useCompleteSale();

  const { config: pickingConfig } = usePickingConfig();
  const [pickingVerified, setPickingVerified] = useState(true);

  const handleVerificationChange = useCallback((canShip: boolean) => {
    setPickingVerified(canShip);
  }, []);

  const [swapLine, setSwapLine] = useState<SaleLine | null>(null);
  const [shipDialogOpen, setShipDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState("");
  const [shippingNotes, setShippingNotes] = useState("");

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleConfirm = async () => {
    try {
      await confirmSale.mutateAsync(saleId);
    } catch {
      // Error handled by mutation
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSale.mutateAsync(saleId);
    } catch {
      // Error handled by mutation
    }
  };

  const handleStartPicking = async () => {
    try {
      await startPicking.mutateAsync(saleId);
    } catch {
      // Error handled by mutation
    }
  };

  const handleShip = async () => {
    try {
      await shipSale.mutateAsync({
        id: saleId,
        data: {
          trackingNumber: trackingNumber || undefined,
          shippingCarrier: shippingCarrier || undefined,
          shippingNotes: shippingNotes || undefined,
        },
      });
      setShipDialogOpen(false);
      setTrackingNumber("");
      setShippingCarrier("");
      setShippingNotes("");
    } catch {
      // Error handled by mutation
    }
  };

  const handleComplete = async () => {
    try {
      await completeSale.mutateAsync(saleId);
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !sale) {
    return (
      <div className="space-y-6">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/sales">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">{t("error.loading")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/sales">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {sale.saleNumber}
              </h1>
              <SaleStatusBadge status={sale.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("detail.createdAt", {
                date: formatDateTimeMedium(sale.createdAt, locale),
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {sale.canConfirm && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={confirmSale.isPending}>
                  {confirmSale.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  {t("actions.confirm")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("confirmSale.title")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("confirmSale.description")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={confirmSale.isPending}>
                    {tCommon("cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirm}
                    disabled={confirmSale.isPending}
                  >
                    {confirmSale.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {confirmSale.isPending
                      ? tCommon("loading")
                      : t("actions.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {sale.canStartPicking && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={startPicking.isPending}>
                  {startPicking.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PackageSearch className="mr-2 h-4 w-4" />
                  )}
                  {t("actions.startPicking")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("startPicking.title")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("startPicking.description")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={startPicking.isPending}>
                    {tCommon("cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleStartPicking}
                    disabled={startPicking.isPending}
                  >
                    {startPicking.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {startPicking.isPending
                      ? tCommon("loading")
                      : t("actions.startPicking")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {sale.canShip && (
            <Dialog open={shipDialogOpen} onOpenChange={setShipDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={shipSale.isPending || !pickingVerified}
                  title={
                    !pickingVerified ? t("picking.shipBlocked") : undefined
                  }
                >
                  {shipSale.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Truck className="mr-2 h-4 w-4" />
                  )}
                  {t("actions.shipSale")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("shipSale.title")}</DialogTitle>
                  <DialogDescription>
                    {t("shipSale.description")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="trackingNumber">
                      {t("fields.trackingNumber")}
                    </Label>
                    <Input
                      id="trackingNumber"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder={t("fields.trackingNumberPlaceholder")}
                      disabled={shipSale.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingCarrier">
                      {t("fields.shippingCarrier")}
                    </Label>
                    <Input
                      id="shippingCarrier"
                      value={shippingCarrier}
                      onChange={(e) => setShippingCarrier(e.target.value)}
                      placeholder={t("fields.shippingCarrierPlaceholder")}
                      disabled={shipSale.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingNotes">
                      {t("fields.shippingNotes")}
                    </Label>
                    <Input
                      id="shippingNotes"
                      value={shippingNotes}
                      onChange={(e) => setShippingNotes(e.target.value)}
                      placeholder={t("fields.shippingNotesPlaceholder")}
                      disabled={shipSale.isPending}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShipDialogOpen(false)}
                    disabled={shipSale.isPending}
                  >
                    {tCommon("cancel")}
                  </Button>
                  <Button onClick={handleShip} disabled={shipSale.isPending}>
                    {shipSale.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {shipSale.isPending
                      ? tCommon("loading")
                      : t("actions.shipSale")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {sale.canComplete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={completeSale.isPending}>
                  {completeSale.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PackageCheck className="mr-2 h-4 w-4" />
                  )}
                  {t("actions.completeSale")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("completeSale.title")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("completeSale.description")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={completeSale.isPending}>
                    {tCommon("cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleComplete}
                    disabled={completeSale.isPending}
                  >
                    {completeSale.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {completeSale.isPending
                      ? tCommon("loading")
                      : t("completeSale.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {sale.canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={cancelSale.isPending}>
                  {cancelSale.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  {t("actions.cancelSale")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("cancelSale.title")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("cancelSale.description")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={cancelSale.isPending}>
                    {tCommon("cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    disabled={cancelSale.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {cancelSale.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {cancelSale.isPending
                      ? tCommon("loading")
                      : t("actions.cancelSale")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Sale Info + Shipping & Timeline side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sale Info + Shipping Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("detail.info")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("fields.warehouse")}
                </dt>
                <dd className="mt-1 font-medium">{sale.warehouseName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("fields.customer")}
                </dt>
                <dd className="mt-1">{sale.customerReference || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("fields.externalReference")}
                </dt>
                <dd className="mt-1 font-mono text-sm">
                  {sale.externalReference || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("fields.total")}
                </dt>
                <dd className="mt-1 text-lg font-bold">
                  {formatCurrency(sale.totalAmount, sale.currency)}
                </dd>
              </div>
              {sale.note && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">
                    {t("fields.note")}
                  </dt>
                  <dd className="mt-1">{sale.note}</dd>
                </div>
              )}
            </dl>

            {/* Shipping Details (inline) */}
            {(sale.trackingNumber ||
              sale.shippingCarrier ||
              sale.shippingNotes) && (
              <>
                <div className="border-t pt-4">
                  <h4 className="mb-3 text-sm font-semibold text-foreground">
                    {t("detail.shippingDetails")}
                  </h4>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {sale.trackingNumber && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          {t("fields.trackingNumber")}
                        </dt>
                        <dd className="mt-1 font-mono text-sm">
                          {sale.trackingNumber}
                        </dd>
                      </div>
                    )}
                    {sale.shippingCarrier && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          {t("fields.shippingCarrier")}
                        </dt>
                        <dd className="mt-1">{sale.shippingCarrier}</dd>
                      </div>
                    )}
                    {sale.shippingNotes && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-muted-foreground">
                          {t("fields.shippingNotes")}
                        </dt>
                        <dd className="mt-1">{sale.shippingNotes}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Timeline Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("detail.timeline")}</CardTitle>
          </CardHeader>
          <CardContent>
            <SaleTimeline
              status={sale.status}
              pickingEnabled={sale.pickingEnabled}
              createdAt={sale.createdAt}
              createdByName={sale.createdByName}
              confirmedAt={sale.confirmedAt}
              confirmedByName={sale.confirmedByName}
              pickedAt={sale.pickedAt}
              pickedByName={sale.pickedByName}
              shippedAt={sale.shippedAt}
              shippedByName={sale.shippedByName}
              completedAt={sale.completedAt}
              completedByName={sale.completedByName}
              cancelledAt={sale.cancelledAt}
              cancelledByName={sale.cancelledByName}
              returnedAt={sale.returnedAt}
              returnedByName={sale.returnedByName}
            />
          </CardContent>
        </Card>
      </div>

      {/* Picking Verification Card */}
      {sale.isPicking && pickingConfig.mode !== "OFF" && (
        <PickingVerificationCard
          lines={sale.lines}
          saleId={sale.id}
          onVerificationChange={handleVerificationChange}
        />
      )}

      {/* Returns Card - shown when sale has returns */}
      {saleReturns && saleReturns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Undo2 className="h-5 w-5" />
              {tReturns("title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {saleReturns.map((ret) => (
                <div
                  key={ret.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{ret.returnNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {tReturns(
                        `types.${ret.type === "RETURN_CUSTOMER" ? "customer" : "supplier"}`,
                      )}
                      {" · "}
                      {tReturns(`status.${ret.status.toLowerCase()}`)}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/returns/${ret.id}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {t("actions.view")}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Swap Dialog */}
      {swapLine && (
        <SaleSwapDialog
          saleId={sale.id}
          line={swapLine}
          saleCurrency={sale.currency}
          open={!!swapLine}
          onOpenChange={(open) => !open && setSwapLine(null)}
        />
      )}

      {/* Lines Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("detail.lines")}
            {sale.totalItems > 0 && ` (${sale.totalItems})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sale.lines.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">{t("form.noLines")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                    <th className="pb-3 pr-4">{t("fields.product")}</th>
                    <th className="pb-3 pr-4">{t("fields.quantity")}</th>
                    <th className="pb-3 pr-4">{t("fields.salePrice")}</th>
                    <th className="pb-3 pr-4 text-right">
                      {t("fields.lineTotal")}
                    </th>
                    {sale.canSwapLine && (
                      <th className="pb-3 pl-4 text-right" />
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sale.lines.map((line) => (
                    <tr key={line.id} className="border-b">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{line.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {line.productSku}
                        </p>
                      </td>
                      <td className="py-3 pr-4">{line.quantity}</td>
                      <td className="py-3 pr-4">
                        {formatCurrency(line.salePrice, line.currency)}
                      </td>
                      <td className="py-3 pr-4 text-right font-medium">
                        {formatCurrency(line.totalPrice, line.currency)}
                      </td>
                      {sale.canSwapLine && (
                        <td className="py-3 pl-4 text-right">
                          <PermissionGate permission={PERMISSIONS.SALES_SWAP}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSwapLine(line)}
                            >
                              <ArrowLeftRight className="mr-1 h-4 w-4" />
                              {t("actions.swapLine")}
                            </Button>
                          </PermissionGate>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2">
                    <td
                      colSpan={sale.canSwapLine ? 4 : 3}
                      className="py-3 pr-4 text-right font-bold"
                    >
                      {t("fields.total")}
                    </td>
                    <td className="py-3 text-right text-lg font-bold">
                      {formatCurrency(sale.totalAmount, sale.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Swap History */}
      <SaleSwapHistory saleId={sale.id} />
    </div>
  );
}
