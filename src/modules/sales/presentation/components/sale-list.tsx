"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Search,
  ShoppingCart,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Skeleton } from "@/ui/components/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
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
import { useSales, useConfirmSale, useCancelSale } from "../hooks/use-sales";
import { SaleStatusBadge } from "./sale-status-badge";
import { SaleFiltersComponent } from "./sale-filters";
import type { SaleFilters } from "../../application/dto/sale.dto";
import type { Sale } from "../../domain/entities/sale.entity";

export function SaleList() {
  const t = useTranslations("sales");
  const tCommon = useTranslations("common");
  const [filters, setFilters] = useState<SaleFilters>({
    page: 1,
    limit: 10,
  });
  const [searchValue, setSearchValue] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<Sale | null>(null);
  const [cancelDialog, setCancelDialog] = useState<Sale | null>(null);

  const { data, isLoading, isError } = useSales(filters);
  const confirmSale = useConfirmSale();
  const cancelSale = useCancelSale();

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

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
    if (!confirmDialog) return;
    try {
      await confirmSale.mutateAsync(confirmDialog.id);
      setConfirmDialog(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleCancel = async () => {
    if (!cancelDialog) return;
    try {
      await cancelSale.mutateAsync(cancelDialog.id);
      setCancelDialog(null);
    } catch {
      // Error handled by mutation
    }
  };

  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-destructive">{t("error.loading")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t("list.title")}</CardTitle>
            <Button asChild>
              <Link href="/dashboard/sales/new">
                <Plus className="mr-2 h-4 w-4" />
                {t("actions.new")}
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("search.placeholder")}
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <SaleFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="py-10 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t("empty.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("empty.description")}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/sales/new">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("actions.new")}
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                      <th className="pb-3 pr-4">{t("fields.saleNumber")}</th>
                      <th className="pb-3 pr-4">{t("fields.status")}</th>
                      <th className="pb-3 pr-4">{t("fields.warehouse")}</th>
                      <th className="pb-3 pr-4">{t("fields.customer")}</th>
                      <th className="pb-3 pr-4">{t("fields.items")}</th>
                      <th className="pb-3 pr-4">{t("fields.total")}</th>
                      <th className="pb-3 pr-4">{t("fields.createdAt")}</th>
                      <th className="pb-3 pr-4 text-right">
                        {tCommon("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((sale) => (
                      <tr key={sale.id} className="border-b">
                        <td className="py-4 pr-4">
                          <Link
                            href={`/dashboard/sales/${sale.id}`}
                            className="font-mono text-sm font-medium hover:underline"
                          >
                            {sale.saleNumber}
                          </Link>
                        </td>
                        <td className="py-4 pr-4">
                          <SaleStatusBadge status={sale.status} />
                        </td>
                        <td className="py-4 pr-4">{sale.warehouseName}</td>
                        <td className="py-4 pr-4">
                          {sale.customerReference || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-4 pr-4">
                          <span className="font-medium">{sale.totalItems}</span>
                        </td>
                        <td className="py-4 pr-4 font-medium">
                          {formatCurrency(sale.totalAmount, sale.currency)}
                        </td>
                        <td className="py-4 pr-4 text-sm text-muted-foreground">
                          {formatDate(sale.createdAt)}
                        </td>
                        <td className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/sales/${sale.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t("actions.view")}
                                </Link>
                              </DropdownMenuItem>
                              {sale.canConfirm && (
                                <DropdownMenuItem
                                  onClick={() => setConfirmDialog(sale)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  {t("actions.confirm")}
                                </DropdownMenuItem>
                              )}
                              {sale.canCancel && (
                                <DropdownMenuItem
                                  onClick={() => setCancelDialog(sale)}
                                  className="text-destructive"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  {t("actions.cancel")}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data.pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t("pagination.showing", {
                      from:
                        (data.pagination.page - 1) * data.pagination.limit + 1,
                      to: Math.min(
                        data.pagination.page * data.pagination.limit,
                        data.pagination.total,
                      ),
                      total: data.pagination.total,
                    })}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={data.pagination.page <= 1}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: data.pagination.page - 1,
                        }))
                      }
                    >
                      {tCommon("previous")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        data.pagination.page >= data.pagination.totalPages
                      }
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: data.pagination.page + 1,
                        }))
                      }
                    >
                      {tCommon("next")}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirm Sale Dialog */}
      <AlertDialog
        open={!!confirmDialog}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
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

      {/* Cancel Sale Dialog */}
      <AlertDialog
        open={!!cancelDialog}
        onOpenChange={(open) => !open && setCancelDialog(null)}
      >
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
    </>
  );
}
