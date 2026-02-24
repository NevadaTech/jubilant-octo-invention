"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Package,
  Loader2,
} from "lucide-react";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
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
  useReturn,
  useConfirmReturn,
  useCancelReturn,
} from "../hooks/use-returns";
import { ReturnStatusBadge } from "./return-status-badge";
import { ReturnTypeBadge } from "./return-type-badge";

interface ReturnDetailProps {
  returnId: string;
}

export function ReturnDetail({ returnId }: ReturnDetailProps) {
  const t = useTranslations("returns");
  const tCommon = useTranslations("common");
  const { data: returnData, isLoading, isError } = useReturn(returnId);
  const confirmReturn = useConfirmReturn();
  const cancelReturn = useCancelReturn();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !returnData) {
    return (
      <div className="space-y-6">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/returns">
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/returns">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {returnData.returnNumber}
              </h1>
              <ReturnStatusBadge status={returnData.status} />
              <ReturnTypeBadge type={returnData.type} />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("detail.createdAt", {
                date: formatDate(returnData.createdAt),
              })}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {returnData.canConfirm && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={confirmReturn.isPending}>
                  {confirmReturn.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  {t("actions.confirm")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("confirmReturn.title")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("confirmReturn.description")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={confirmReturn.isPending}>
                    {tCommon("cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirm}
                    disabled={confirmReturn.isPending}
                  >
                    {confirmReturn.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {confirmReturn.isPending
                      ? tCommon("loading")
                      : t("actions.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {returnData.canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={cancelReturn.isPending}>
                  {cancelReturn.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  {t("actions.cancelReturn")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("cancelReturn.title")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("cancelReturn.description")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={cancelReturn.isPending}>
                    {tCommon("cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    disabled={cancelReturn.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {cancelReturn.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {cancelReturn.isPending
                      ? tCommon("loading")
                      : t("actions.cancelReturn")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Return Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("detail.info")}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("fields.warehouse")}
              </dt>
              <dd className="mt-1 font-medium">{returnData.warehouseName}</dd>
            </div>
            {returnData.saleNumber && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("fields.saleReference")}
                </dt>
                <dd className="mt-1 font-mono text-sm">
                  {returnData.saleNumber}
                </dd>
              </div>
            )}
            {returnData.reason && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("fields.reason")}
                </dt>
                <dd className="mt-1">{returnData.reason}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("fields.total")}
              </dt>
              <dd className="mt-1 text-lg font-bold">
                {formatCurrency(returnData.totalAmount, returnData.currency)}
              </dd>
            </div>
            {returnData.confirmedAt && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("fields.confirmedAt")}
                </dt>
                <dd className="mt-1">{formatDate(returnData.confirmedAt)}</dd>
              </div>
            )}
            {returnData.cancelledAt && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("fields.cancelledAt")}
                </dt>
                <dd className="mt-1">{formatDate(returnData.cancelledAt)}</dd>
              </div>
            )}
            {returnData.note && (
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("fields.note")}
                </dt>
                <dd className="mt-1">{returnData.note}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Lines Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("detail.lines")} ({returnData.totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {returnData.lines.length === 0 ? (
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
                    <th className="pb-3 pr-4">
                      {returnData.isCustomerReturn
                        ? t("fields.originalPrice")
                        : t("fields.originalCost")}
                    </th>
                    <th className="pb-3 pr-4 text-right">
                      {t("fields.lineTotal")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {returnData.lines.map((line) => (
                    <tr key={line.id} className="border-b">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{line.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {line.productSku}
                        </p>
                      </td>
                      <td className="py-3 pr-4">{line.quantity}</td>
                      <td className="py-3 pr-4">
                        {line.originalSalePrice
                          ? formatCurrency(
                              line.originalSalePrice,
                              line.currency,
                            )
                          : line.originalUnitCost
                            ? formatCurrency(
                                line.originalUnitCost,
                                line.currency,
                              )
                            : "-"}
                      </td>
                      <td className="py-3 pr-4 text-right font-medium">
                        {formatCurrency(line.totalPrice, line.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2">
                    <td colSpan={3} className="py-3 pr-4 text-right font-bold">
                      {t("fields.total")}
                    </td>
                    <td className="py-3 text-right text-lg font-bold">
                      {formatCurrency(
                        returnData.totalAmount,
                        returnData.currency,
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
