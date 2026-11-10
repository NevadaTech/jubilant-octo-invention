"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatDateTimeMedium } from "@/lib/date";
import { Link } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/ui/layout/page-header";
import { Button } from "@/ui/components/button";
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
  useCancelReturn,
  useConfirmReturn,
  useReturn,
} from "@/modules/returns/presentation/hooks/use-returns";
import { ReturnStatusBadge } from "./return-status-badge";
import { ReturnTypeBadge } from "./return-type-badge";

interface ReturnDetailProps {
  returnId: string;
}

export function ReturnDetail({ returnId }: ReturnDetailProps) {
  const t = useTranslations("returns");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { data: returnData, isLoading, isError } = useReturn(returnId);
  const confirmReturn = useConfirmReturn();
  const cancelReturn = useCancelReturn();

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "COP",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleConfirm = async () => {
    try {
      await confirmReturn.mutateAsync(returnId);
    } catch {
      // Error handled by mutation
    }
  };

  const handleCancel = async () => {
    try {
      await cancelReturn.mutateAsync(returnId);
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !returnData) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/returns"
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

  const reference = returnData.saleNumber;
  const description = [
    t(
      `types.${returnData.type === "RETURN_CUSTOMER" ? "customer" : "supplier"}`,
    ),
    reference,
    returnData.warehouseName,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={returnData.returnNumber}
        description={description}
        action={
          returnData.canConfirm ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="rounded-lg" disabled={confirmReturn.isPending}>
                  {confirmReturn.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t("actions.confirm")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl sm:max-w-[500px]">
                <AlertDialogHeader>
                  <p className="text-xs font-semibold text-primary">
                    {t("title")}
                  </p>
                  <AlertDialogTitle>{t("confirmReturn.title")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("confirmReturn.description")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-start">
                  <AlertDialogCancel disabled={confirmReturn.isPending}>
                    {tCommon("cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirm}
                    disabled={confirmReturn.isPending}
                  >
                    {confirmReturn.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {confirmReturn.isPending
                      ? tCommon("loading")
                      : t("actions.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <ReturnStatusBadge status={returnData.status} />
        <ReturnTypeBadge type={returnData.type} />
      </div>

      <p className="text-sm text-muted-foreground">
        {t("detail.createdAt", {
          date: formatDateTimeMedium(returnData.createdAt, locale),
        })}
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-card px-3.5 py-2.5">
          <span className="text-sm text-muted-foreground">
            {t("fields.warehouse")}
          </span>
          <span className="text-sm font-semibold">{returnData.warehouseName}</span>
        </div>
        {returnData.saleNumber ? (
          <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-card px-3.5 py-2.5">
            <span className="text-sm text-muted-foreground">
              {t("fields.saleReference")}
            </span>
            <span className="text-sm font-semibold">{returnData.saleNumber}</span>
          </div>
        ) : null}
      </div>

      {returnData.reason ? (
        <p className="text-sm">
          <span>{t("fields.reason")}</span>
          {": "}
          <span>{returnData.reason}</span>
        </p>
      ) : null}
      {returnData.note ? (
        <p className="text-sm text-muted-foreground">
          <span>{t("fields.note")}</span>
          {": "}
          <span>{returnData.note}</span>
        </p>
      ) : null}

      {returnData.canCancel ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-fit rounded-lg border-destructive text-destructive hover:bg-destructive/10"
              disabled={cancelReturn.isPending}
            >
              {cancelReturn.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {t("actions.cancelReturn")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl sm:max-w-[500px]">
            <AlertDialogHeader>
              <p className="text-xs font-semibold text-primary">{t("title")}</p>
              <AlertDialogTitle>{t("cancelReturn.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("cancelReturn.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-start">
              <AlertDialogCancel disabled={cancelReturn.isPending}>
                {tCommon("cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancel}
                disabled={cancelReturn.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {cancelReturn.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {cancelReturn.isPending
                  ? tCommon("loading")
                  : t("actions.cancelReturn")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">
          {t("detail.lines")}
          {returnData.totalItems > 0 ? ` (${returnData.totalItems})` : ""}
        </h2>
        {returnData.lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("form.noLines")}</p>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-xl border border-border bg-card lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted text-xs font-semibold text-muted-foreground">
                    <th className="h-10 px-3 text-left">{t("fields.product")}</th>
                    <th className="h-10 px-3 text-left">{t("fields.quantity")}</th>
                    <th className="h-10 px-3 text-left">
                      {returnData.isCustomerReturn
                        ? t("fields.originalPrice")
                        : t("fields.originalCost")}
                    </th>
                    <th className="h-10 px-3 text-left">{t("fields.lineTotal")}</th>
                  </tr>
                </thead>
                <tbody>
                  {returnData.lines.map((line) => {
                    const unit =
                      line.originalSalePrice ?? line.originalUnitCost;
                    return (
                      <tr key={line.id} className="border-t border-border">
                        <td className="px-3 py-3">
                          <p className="font-medium">{line.productName}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {line.productSku}
                          </p>
                        </td>
                        <td className="px-3 py-3">{line.quantity}</td>
                        <td className="px-3 py-3">
                          {unit != null
                            ? formatCurrency(unit, line.currency)
                            : "—"}
                        </td>
                        <td className="px-3 py-3">
                          {formatCurrency(line.totalPrice, line.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="flex flex-col gap-3 lg:hidden">
              {returnData.lines.map((line) => {
                const unit = line.originalSalePrice ?? line.originalUnitCost;
                return (
                  <li
                    key={line.id}
                    className="rounded-xl border border-border bg-card p-3.5 text-sm"
                  >
                    {line.productName}
                    {" · "}
                    {line.quantity}
                    {unit != null
                      ? ` · ${t("fields.originalPrice")} ${formatCurrency(unit, line.currency)}`
                      : ""}
                  </li>
                );
              })}
            </ul>
            <p className="text-lg font-bold">
              {t("fields.total")}{" "}
              <span>
                {formatCurrency(returnData.totalAmount, returnData.currency)}
              </span>
            </p>
          </>
        )}
      </section>

      <Link
        href="/dashboard/returns"
        className="text-sm font-semibold text-primary"
      >
        {t("detail.backToList")}
      </Link>
    </div>
  );
}
