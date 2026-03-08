"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  Warehouse,
  User,
  UserRoundSearch,
  Calendar,
  FileText,
  Hash,
  MessageSquare,
  CheckCircle,
  XCircle,
  Pencil,
  Loader2,
  Undo2,
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
} from "@/ui/components/alert-dialog";
import { useState } from "react";
import {
  useMovement,
  usePostMovement,
  useVoidMovement,
} from "@/modules/inventory/presentation/hooks/use-movements";
import { MovementTypeBadge } from "./movement-type-badge";
import { MovementStatusBadge } from "./movement-status-badge";

interface MovementDetailProps {
  movementId: string;
}

export function MovementDetail({ movementId }: MovementDetailProps) {
  const t = useTranslations("inventory.movements");
  const tCommon = useTranslations("common");
  const { data: movement, isLoading, isError } = useMovement(movementId);
  const postMovement = usePostMovement();
  const voidMovement = useVoidMovement();
  const [postConfirm, setPostConfirm] = useState(false);
  const [voidConfirm, setVoidConfirm] = useState(false);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(undefined, {
      dateStyle: "long",
      timeStyle: "short",
    }).format(date);

  const formatCurrency = (value: number | null, currency?: string | null) => {
    if (value === null) return "-";
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency ?? "USD",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !movement) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/inventory/movements">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {t("detail.notFound")}
          </h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("detail.notFoundDescription")}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/dashboard/inventory/movements">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {t("detail.title")}
                </h1>
                <MovementTypeBadge type={movement.type} />
                <MovementStatusBadge status={movement.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("detail.subtitle", { id: movement.id.slice(0, 8) })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {movement.isDraft && (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={`/dashboard/inventory/movements/${movement.id}/edit?returnTo=/dashboard/inventory/movements/${movement.id}`}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    {t("actions.edit")}
                  </Link>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setPostConfirm(true)}
                  disabled={postMovement.isPending}
                >
                  {postMovement.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  {t("actions.post")}
                </Button>
              </>
            )}
            {movement.canVoid && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setVoidConfirm(true)}
                disabled={voidMovement.isPending}
              >
                {voidMovement.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                {t("actions.void")}
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Movement Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.information")}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Warehouse - full width */}
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3 mb-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-background border">
                  <Warehouse className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("fields.warehouse")}
                  </p>
                  <p className="font-semibold text-base leading-tight">
                    {movement.warehouseName || movement.warehouseId}
                  </p>
                  {movement.warehouseCode && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {movement.warehouseCode}
                    </p>
                  )}
                </div>
              </div>

              {/* Supplier */}
              {movement.contactName && (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3 mb-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-background border">
                    <UserRoundSearch className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t("fields.supplier")}
                    </p>
                    <p className="font-semibold text-base leading-tight">
                      {movement.contactName}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Reference */}
                {movement.reference && (
                  <div className="flex items-start gap-3">
                    <Hash className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t("fields.reference")}
                      </p>
                      <p className="font-mono">{movement.reference}</p>
                    </div>
                  </div>
                )}

                {/* Reason */}
                {movement.reason && (
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t("fields.reason")}
                      </p>
                      <p>{movement.reason}</p>
                    </div>
                  </div>
                )}

                {/* Created By */}
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("fields.createdBy")}
                    </p>
                    <p>{movement.createdByName ?? movement.createdBy}</p>
                  </div>
                </div>

                {/* Created At */}
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("fields.createdAt")}
                    </p>
                    <p>{formatDate(movement.createdAt)}</p>
                  </div>
                </div>

                {/* Posted By */}
                {movement.postedBy && (
                  <div className="flex items-start gap-3">
                    <User className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t("fields.postedBy")}
                      </p>
                      <p>{movement.postedByName ?? movement.postedBy}</p>
                    </div>
                  </div>
                )}

                {/* Posted At */}
                {movement.postedAt && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 text-green-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t("fields.postedAt")}
                      </p>
                      <p>{formatDate(movement.postedAt)}</p>
                    </div>
                  </div>
                )}

                {/* Returned By */}
                {movement.returnedBy && (
                  <div className="flex items-start gap-3">
                    <User className="mt-0.5 h-5 w-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t("fields.returnedBy")}
                      </p>
                      <p>{movement.returnedByName ?? movement.returnedBy}</p>
                    </div>
                  </div>
                )}

                {/* Returned At */}
                {movement.returnedAt && (
                  <div className="flex items-start gap-3">
                    <Undo2 className="mt-0.5 h-5 w-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t("fields.returnedAt")}
                      </p>
                      <p>{formatDate(movement.returnedAt)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Note - full width below grid */}
              {movement.note && (
                <div className="flex items-start gap-3 mt-5 pt-5 border-t">
                  <MessageSquare className="mt-0.5 h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("fields.note")}
                    </p>
                    <p className="text-sm">{movement.note}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.summary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t("fields.totalItems")}
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {movement.totalItems}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t("fields.totalQuantity")}
                  </p>
                  <p
                    className={`text-3xl font-bold mt-1 ${
                      movement.isEntry
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {movement.isEntry ? "+" : "-"}
                    {movement.totalQuantity}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("fields.type")}
                  </span>
                  <MovementTypeBadge type={movement.type} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("fields.status")}
                  </span>
                  <MovementStatusBadge status={movement.status} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("detail.products")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                    <th className="pb-3 pr-4">{t("fields.product")}</th>
                    <th className="pb-3 pr-4">SKU</th>
                    <th className="pb-3 pr-4 text-right">
                      {t("fields.quantity")}
                    </th>
                    <th className="pb-3 pr-4 text-right">
                      {t("fields.unitCost")}
                    </th>
                    <th className="pb-3 text-right">{t("fields.totalCost")}</th>
                  </tr>
                </thead>
                <tbody>
                  {movement.lines.map((line) => {
                    const lineTotalCost =
                      line.unitCost !== null
                        ? line.quantity * line.unitCost
                        : null;
                    return (
                      <tr key={line.id} className="border-b">
                        <td className="py-4 pr-4 font-medium">
                          {line.productName}
                        </td>
                        <td className="py-4 pr-4 font-mono text-sm text-muted-foreground">
                          {line.productSku}
                        </td>
                        <td className="py-4 pr-4 text-right">
                          <span
                            className={
                              movement.isEntry
                                ? "text-green-600 dark:text-green-400 font-medium"
                                : "text-red-600 dark:text-red-400 font-medium"
                            }
                          >
                            {movement.isEntry ? "+" : "-"}
                            {line.quantity}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-right text-muted-foreground">
                          {formatCurrency(line.unitCost, line.currency)}
                        </td>
                        <td className="py-4 text-right font-medium">
                          {formatCurrency(lineTotalCost, line.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {movement.lines.some((l) => l.unitCost !== null) &&
                  (() => {
                    const totalCost = movement.lines.reduce(
                      (sum, l) =>
                        sum +
                        (l.unitCost !== null ? l.quantity * l.unitCost : 0),
                      0,
                    );
                    const currency =
                      movement.lines.find((l) => l.currency)?.currency ?? null;
                    return (
                      <tfoot>
                        <tr className="border-t-2">
                          <td
                            colSpan={3}
                            className="pt-4 pr-4 text-sm font-medium text-muted-foreground text-right"
                          >
                            {t("detail.total")}
                          </td>
                          <td className="pt-4 pr-4" />
                          <td className="pt-4 text-right font-bold text-base">
                            {formatCurrency(totalCost, currency)}
                          </td>
                        </tr>
                      </tfoot>
                    );
                  })()}
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Post Confirmation */}
      <AlertDialog open={postConfirm} onOpenChange={setPostConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmPost.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmPost.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={postMovement.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await postMovement.mutateAsync(movement.id);
                setPostConfirm(false);
              }}
              disabled={postMovement.isPending}
            >
              {postMovement.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {postMovement.isPending ? tCommon("loading") : t("actions.post")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Void Confirmation */}
      <AlertDialog open={voidConfirm} onOpenChange={setVoidConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmVoid.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmVoid.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={voidMovement.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await voidMovement.mutateAsync(movement.id);
                setVoidConfirm(false);
              }}
              disabled={voidMovement.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {voidMovement.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {voidMovement.isPending ? tCommon("loading") : t("actions.void")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
