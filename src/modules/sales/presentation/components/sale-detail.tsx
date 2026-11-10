"use client";

import { Fragment, useCallback, useMemo, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/ui/layout/page-header";
import { Button } from "@/ui/components/button";
import { Badge } from "@/ui/components/badge";
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
  useCancelSale,
  useCompleteSale,
  useConfirmSale,
  useSale,
  useSaleReturns,
  useShipSale,
  useStartPicking,
} from "@/modules/sales/presentation/hooks/use-sales";
import { useCombos } from "@/modules/inventory/presentation/hooks/use-combos";
import { PermissionGate } from "@/shared/presentation/components/permission-gate";
import { PERMISSIONS } from "@/shared/domain/permissions";
import { SaleStatusBadge } from "./sale-status-badge";
import { SaleTimeline } from "./sale-timeline";
import { SaleSwapDialog } from "./sale-swap-dialog";
import { SaleSwapHistory } from "./sale-swap-history";
import { PickingVerificationCard } from "./picking-verification-card";
import { ContactTypeBadge } from "@/modules/contacts/presentation/components/contact-type-badge";
import { usePickingConfig } from "@/modules/sales/presentation/hooks/use-picking-config";
import type { ContactType } from "@/modules/contacts/domain/entities/contact.entity";
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

  const hasComboLines = sale?.lines.some((line) => line.comboId) ?? false;
  const { data: combosData } = useCombos({ limit: 100, isActive: true });

  const comboNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const combo of combosData?.data ?? []) {
      map.set(combo.id, combo.name);
    }
    return map;
  }, [combosData]);

  const groupedLines = useMemo(() => {
    if (!sale || !hasComboLines) return null;

    const groups: {
      comboId: string | null;
      comboName: string | null;
      lines: typeof sale.lines;
    }[] = [];
    const groupMap = new Map<string, number>();

    for (const line of sale.lines) {
      const comboId = line.comboId ?? null;
      const key = comboId ?? "__standalone__";
      const existing = groupMap.get(key);
      if (existing !== undefined) {
        groups[existing].lines.push(line);
      } else {
        groupMap.set(key, groups.length);
        groups.push({
          comboId,
          comboName: comboId ? (comboNameMap.get(comboId) ?? null) : null,
          lines: [line],
        });
      }
    }

    groups.sort((a, b) => {
      if (a.comboId && !b.comboId) return -1;
      if (!a.comboId && b.comboId) return 1;
      return 0;
    });

    return groups;
  }, [sale, hasComboLines, comboNameMap]);

  const [pickingVerified, setPickingVerified] = useState(true);
  const handleVerificationChange = useCallback((canShip: boolean) => {
    setPickingVerified(canShip);
  }, []);

  const [swapLine, setSwapLine] = useState<SaleLine | null>(null);
  const [shipDialogOpen, setShipDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState("");
  const [shippingNotes, setShippingNotes] = useState("");

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "COP",
      minimumFractionDigits: 0,
    }).format(amount);

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
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !sale) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/sales"
          className="text-sm font-semibold text-primary"
        >
          {t("detail.backToList")}
        </Link>
        <p className="rounded-xl border border-border bg-card px-4 py-10 text-center text-destructive">
          {t("error.loading")}
        </p>
      </div>
    );
  }

  const contactLabel = sale.contactName || sale.customerReference;
  const descriptionParts = [contactLabel, sale.warehouseName].filter(Boolean);
  const description =
    descriptionParts.length > 1 ? descriptionParts.join(" · ") : undefined;
  const lineGroups = groupedLines ?? [
    { comboId: null, comboName: null, lines: sale.lines },
  ];

  const primaryAction = sale.canConfirm ? (
    <ConfirmDialog
      pending={confirmSale.isPending}
      onConfirm={handleConfirm}
      label={t("actions.confirm")}
      title={t("confirmSale.title")}
      description={t("confirmSale.description")}
      section={t("title")}
      cancelLabel={tCommon("cancel")}
      loadingLabel={tCommon("loading")}
    />
  ) : sale.canStartPicking ? (
    <ConfirmDialog
      pending={startPicking.isPending}
      onConfirm={handleStartPicking}
      label={t("actions.startPicking")}
      title={t("startPicking.title")}
      description={t("startPicking.description")}
      section={t("title")}
      cancelLabel={tCommon("cancel")}
      loadingLabel={tCommon("loading")}
    />
  ) : sale.canShip ? (
    <Dialog open={shipDialogOpen} onOpenChange={setShipDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="rounded-lg"
          disabled={shipSale.isPending || !pickingVerified}
          title={!pickingVerified ? t("picking.shipBlocked") : undefined}
        >
          {shipSale.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {t("actions.shipSale")}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-[500px]">
        <DialogHeader>
          <p className="text-xs font-semibold text-primary">{t("title")}</p>
          <DialogTitle>{t("shipSale.title")}</DialogTitle>
          <DialogDescription>{t("shipSale.description")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2.5">
          <Field label={t("fields.trackingNumber")} id="trackingNumber">
            <Input
              id="trackingNumber"
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
              placeholder={t("fields.trackingNumberPlaceholder")}
              disabled={shipSale.isPending}
              className="h-11 rounded-lg"
            />
          </Field>
          <Field label={t("fields.shippingCarrier")} id="shippingCarrier">
            <Input
              id="shippingCarrier"
              value={shippingCarrier}
              onChange={(event) => setShippingCarrier(event.target.value)}
              placeholder={t("fields.shippingCarrierPlaceholder")}
              disabled={shipSale.isPending}
              className="h-11 rounded-lg"
            />
          </Field>
          <Field label={t("fields.shippingNotes")} id="shippingNotes">
            <Input
              id="shippingNotes"
              value={shippingNotes}
              onChange={(event) => setShippingNotes(event.target.value)}
              placeholder={t("fields.shippingNotesPlaceholder")}
              disabled={shipSale.isPending}
              className="h-11 rounded-lg"
            />
          </Field>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            variant="outline"
            onClick={() => setShipDialogOpen(false)}
            disabled={shipSale.isPending}
          >
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleShip} disabled={shipSale.isPending}>
            {shipSale.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {shipSale.isPending ? tCommon("loading") : t("actions.shipSale")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : sale.canComplete ? (
    <ConfirmDialog
      pending={completeSale.isPending}
      onConfirm={handleComplete}
      label={t("actions.completeSale")}
      actionLabel={t("completeSale.confirm")}
      title={t("completeSale.title")}
      description={t("completeSale.description")}
      section={t("title")}
      cancelLabel={tCommon("cancel")}
      loadingLabel={tCommon("loading")}
    />
  ) : null;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={sale.saleNumber}
        description={description}
        action={primaryAction}
      />

      <div className="flex flex-wrap items-center gap-2">
        <SaleStatusBadge status={sale.status} />
        {sale.contactType ? (
          <ContactTypeBadge type={sale.contactType as ContactType} />
        ) : null}
        {sale.integrationProvider ? (
          <Badge variant="outline">
            {sale.integrationProvider === "MERCADOLIBRE"
              ? "MercadoLibre"
              : sale.integrationProvider}
          </Badge>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <Fact label={t("fields.customer")}>{contactLabel ?? "-"}</Fact>
        <Fact label={t("fields.warehouse")}>{sale.warehouseName}</Fact>
        <Fact label={t("fields.externalReference")}>
          {sale.externalReference ? (
            <span className="font-mono">{sale.externalReference}</span>
          ) : (
            "-"
          )}
        </Fact>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">{t("detail.timeline")}</h2>
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
      </section>

      {sale.note ? (
        <p className="text-sm text-foreground">
          <span>{t("fields.note")}</span>
          {": "}
          <span>{sale.note}</span>
        </p>
      ) : null}

      {sale.canShip && !pickingVerified ? (
        <p className="max-w-xl rounded-lg bg-warning-100 px-3 py-3 text-sm text-warning-800 dark:bg-warning-900/30 dark:text-warning-300">
          {t("picking.shipBlocked")}. {t("picking.shipBlockedMessage")}
        </p>
      ) : null}

      {sale.canCancel ? (
        <ConfirmDialog
          pending={cancelSale.isPending}
          onConfirm={handleCancel}
          label={t("actions.cancelSale")}
          title={t("cancelSale.title")}
          description={t("cancelSale.description")}
          section={t("title")}
          cancelLabel={tCommon("cancel")}
          loadingLabel={tCommon("loading")}
          destructive
          outline
        />
      ) : null}

      {sale.isPicking && pickingConfig.mode !== "OFF" ? (
        <PickingVerificationCard
          lines={sale.lines}
          saleId={sale.id}
          saleNumber={sale.saleNumber}
          onVerificationChange={handleVerificationChange}
        />
      ) : null}

      {(sale.trackingNumber || sale.shippingCarrier || sale.shippingNotes) && (
        <section className="flex max-w-xl flex-col gap-2">
          <h2 className="text-base font-semibold">
            {t("detail.shippingDetails")}
          </h2>
          {sale.trackingNumber ? (
            <Fact label={t("fields.trackingNumber")}>
              <span className="font-mono">{sale.trackingNumber}</span>
            </Fact>
          ) : null}
          {sale.shippingCarrier ? (
            <Fact label={t("fields.shippingCarrier")}>{sale.shippingCarrier}</Fact>
          ) : null}
          {sale.shippingNotes ? (
            <Fact label={t("fields.shippingNotes")}>{sale.shippingNotes}</Fact>
          ) : null}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">
          {t("detail.lines")}
          {sale.totalItems > 0 ? ` (${sale.totalItems})` : ""}
        </h2>
        {sale.lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("form.noLines")}</p>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-xl border border-border bg-card lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted text-xs font-semibold text-muted-foreground">
                    <th className="h-10 px-3 text-left">{t("fields.product")}</th>
                    <th className="h-10 px-3 text-left">{t("fields.quantity")}</th>
                    <th className="h-10 px-3 text-left">{t("fields.lineTotal")}</th>
                    {sale.canSwapLine ? <th className="h-10 px-3" /> : null}
                  </tr>
                </thead>
                <tbody>
                  {lineGroups.map((group) => (
                    <Fragment key={group.comboId ?? "__standalone__"}>
                      {group.comboId ? (
                        <tr className="border-t border-border bg-primary/5">
                          <td
                            colSpan={sale.canSwapLine ? 4 : 3}
                            className="px-3 py-2 text-sm font-semibold text-primary"
                          >
                            {t("detail.comboGroup", {
                              name: group.comboName ?? group.comboId,
                            })}
                          </td>
                        </tr>
                      ) : null}
                      {group.lines.map((line) => (
                        <tr key={line.id} className="border-t border-border">
                          <td className="px-3 py-3">
                            <p className="font-medium">{line.productName}</p>
                            <p className="font-mono text-xs text-muted-foreground">
                              <span>{line.productSku}</span>
                              {" · "}
                              <span>
                                {formatCurrency(line.salePrice, line.currency)}
                              </span>
                            </p>
                            {group.comboId ? (
                              <Badge variant="info" className="mt-1">
                                {t("detail.fromCombo")}
                              </Badge>
                            ) : null}
                          </td>
                          <td className="px-3 py-3">{line.quantity}</td>
                          <td className="px-3 py-3">
                            {formatCurrency(line.totalPrice, line.currency)}
                          </td>
                          {sale.canSwapLine ? (
                            <td className="px-3 py-3 text-right">
                              <PermissionGate permission={PERMISSIONS.SALES_SWAP}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSwapLine(line)}
                                >
                                  {t("actions.swapLine")}
                                </Button>
                              </PermissionGate>
                            </td>
                          ) : null}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="flex flex-col gap-3 lg:hidden">
              {lineGroups.map((group) => (
                <Fragment key={group.comboId ?? "cards"}>
                  {group.comboId ? (
                    <li className="text-sm font-semibold text-primary">
                      {t("detail.comboGroup", {
                        name: group.comboName ?? group.comboId,
                      })}
                    </li>
                  ) : null}
                  {group.lines.map((line) => (
                    <li
                      key={line.id}
                      className="rounded-xl border border-border bg-card p-3.5"
                    >
                      <p className="text-[15px] font-semibold">
                        {line.productName}
                      </p>
                      <p className="text-[13px] text-muted-foreground">
                        {line.quantity}
                        {" × "}
                        {formatCurrency(line.salePrice, line.currency)}
                      </p>
                      {sale.canSwapLine ? (
                        <PermissionGate permission={PERMISSIONS.SALES_SWAP}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 px-0"
                            onClick={() => setSwapLine(line)}
                          >
                            {t("actions.swapLine")}
                          </Button>
                        </PermissionGate>
                      ) : null}
                    </li>
                  ))}
                </Fragment>
              ))}
            </ul>

            <p className="text-lg font-bold">
              {t("fields.total")}{" "}
              <span>{formatCurrency(sale.totalAmount, sale.currency)}</span>
            </p>
          </>
        )}
      </section>

      {saleReturns && saleReturns.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold">{tReturns("title")}</h2>
          {saleReturns.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/returns/${item.id}`}
              className="rounded-xl border border-border bg-card p-3.5"
            >
              <span className="font-mono text-sm font-semibold">
                {item.returnNumber}
              </span>
              <span className="block text-[13px] text-muted-foreground">
                {tReturns(
                  `types.${item.type === "RETURN_CUSTOMER" ? "customer" : "supplier"}`,
                )}
                {" · "}
                {tReturns(`status.${item.status.toLowerCase()}`)}
              </span>
            </Link>
          ))}
        </section>
      ) : null}

      {swapLine ? (
        <SaleSwapDialog
          saleId={sale.id}
          saleNumber={sale.saleNumber}
          line={swapLine}
          saleCurrency={sale.currency}
          open={!!swapLine}
          onOpenChange={(open) => !open && setSwapLine(null)}
        />
      ) : null}

      <SaleSwapHistory saleId={sale.id} />

      <Link
        href="/dashboard/sales"
        className="text-sm font-semibold text-primary"
      >
        {t("detail.backToList")}
      </Link>
    </div>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-[13px] font-semibold">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-card px-3.5 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{children}</span>
    </div>
  );
}

function ConfirmDialog({
  pending,
  onConfirm,
  label,
  actionLabel,
  title,
  description,
  section,
  cancelLabel,
  loadingLabel,
  destructive = false,
  outline = false,
}: {
  pending: boolean;
  onConfirm: () => void;
  label: string;
  actionLabel?: string;
  title: string;
  description: string;
  section: string;
  cancelLabel: string;
  loadingLabel: string;
  destructive?: boolean;
  outline?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={outline || destructive ? "outline" : "default"}
          className={
            destructive
              ? "w-fit rounded-lg border-destructive text-destructive hover:bg-destructive/10"
              : "rounded-lg"
          }
          disabled={pending}
        >
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl sm:max-w-[500px]">
        <AlertDialogHeader>
          <p className="text-xs font-semibold text-primary">{section}</p>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-start">
          <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={pending}
            className={
              destructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : undefined
            }
          >
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {pending ? loadingLabel : (actionLabel ?? label)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
