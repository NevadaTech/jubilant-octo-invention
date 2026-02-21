"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, CheckCircle, XCircle, Package } from "lucide-react";
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
import { useSale, useConfirmSale, useCancelSale } from "../hooks/use-sales";
import { SaleStatusBadge } from "./sale-status-badge";

interface SaleDetailProps {
  saleId: string;
}

export function SaleDetail({ saleId }: SaleDetailProps) {
  const t = useTranslations("sales");
  const tCommon = useTranslations("common");
  const { data: sale, isLoading, isError } = useSale(saleId);
  const confirmSale = useConfirmSale();
  const cancelSale = useCancelSale();

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
      <div className="flex items-center justify-between">
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
            <p className="text-neutral-500 dark:text-neutral-400">
              {t("detail.createdAt", { date: formatDate(sale.createdAt) })}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {sale.canConfirm && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>
                  <CheckCircle className="mr-2 h-4 w-4" />
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
                  <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirm}
                    disabled={confirmSale.isPending}
                  >
                    {confirmSale.isPending
                      ? tCommon("loading")
                      : t("actions.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {sale.canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
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
                  <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    disabled={cancelSale.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
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

      {/* Sale Info Card */}
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
            {sale.confirmedAt && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("fields.confirmedAt")}
                </dt>
                <dd className="mt-1">{formatDate(sale.confirmedAt)}</dd>
              </div>
            )}
            {sale.cancelledAt && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("fields.cancelledAt")}
                </dt>
                <dd className="mt-1">{formatDate(sale.cancelledAt)}</dd>
              </div>
            )}
            {sale.note && (
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("fields.note")}
                </dt>
                <dd className="mt-1">{sale.note}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Lines Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("detail.lines")} ({sale.totalItems})
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
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2">
                    <td colSpan={3} className="py-3 pr-4 text-right font-bold">
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
    </div>
  );
}
