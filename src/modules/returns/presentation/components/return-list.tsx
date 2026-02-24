"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Search,
  RotateCcw,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Loader2,
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
import {
  useReturns,
  useConfirmReturn,
  useCancelReturn,
} from "../hooks/use-returns";
import { ReturnStatusBadge } from "./return-status-badge";
import { ReturnTypeBadge } from "./return-type-badge";
import { ReturnFiltersComponent } from "./return-filters";
import type { ReturnFilters } from "../../application/dto/return.dto";
import type { Return } from "../../domain/entities/return.entity";

export function ReturnList() {
  const t = useTranslations("returns");
  const tCommon = useTranslations("common");
  const [filters, setFilters] = useState<ReturnFilters>({
    page: 1,
    limit: 10,
  });
  const [searchValue, setSearchValue] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<Return | null>(null);
  const [cancelDialog, setCancelDialog] = useState<Return | null>(null);

  const { data, isLoading, isError } = useReturns(filters);
  const confirmReturn = useConfirmReturn();
  const cancelReturn = useCancelReturn();

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
      await confirmReturn.mutateAsync(confirmDialog.id);
      setConfirmDialog(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleCancel = async () => {
    if (!cancelDialog) return;
    try {
      await cancelReturn.mutateAsync(cancelDialog.id);
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
              <Link href="/dashboard/returns/new">
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
            <ReturnFiltersComponent
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
              <RotateCcw className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t("empty.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("empty.description")}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/returns/new">
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
                      <th className="pb-3 pr-4">{t("fields.returnNumber")}</th>
                      <th className="pb-3 pr-4">{t("fields.type")}</th>
                      <th className="pb-3 pr-4">{t("fields.status")}</th>
                      <th className="pb-3 pr-4">{t("fields.warehouse")}</th>
                      <th className="pb-3 pr-4">{t("fields.items")}</th>
                      <th className="pb-3 pr-4">{t("fields.total")}</th>
                      <th className="pb-3 pr-4">{t("fields.createdAt")}</th>
                      <th className="pb-3 pr-4 text-right">
                        {tCommon("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((ret) => (
                      <tr key={ret.id} className="border-b">
                        <td className="py-4 pr-4">
                          <Link
                            href={`/dashboard/returns/${ret.id}`}
                            className="font-mono text-sm font-medium hover:underline"
                          >
                            {ret.returnNumber}
                          </Link>
                        </td>
                        <td className="py-4 pr-4">
                          <ReturnTypeBadge type={ret.type} />
                        </td>
                        <td className="py-4 pr-4">
                          <ReturnStatusBadge status={ret.status} />
                        </td>
                        <td className="py-4 pr-4">{ret.warehouseName}</td>
                        <td className="py-4 pr-4">
                          <span className="font-medium">{ret.totalItems}</span>
                        </td>
                        <td className="py-4 pr-4 font-medium">
                          {formatCurrency(ret.totalAmount, ret.currency)}
                        </td>
                        <td className="py-4 pr-4 text-sm text-muted-foreground">
                          {formatDate(ret.createdAt)}
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
                                <Link href={`/dashboard/returns/${ret.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t("actions.view")}
                                </Link>
                              </DropdownMenuItem>
                              {ret.canConfirm && (
                                <DropdownMenuItem
                                  onClick={() => setConfirmDialog(ret)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  {t("actions.confirm")}
                                </DropdownMenuItem>
                              )}
                              {ret.canCancel && (
                                <DropdownMenuItem
                                  onClick={() => setCancelDialog(ret)}
                                  className="text-destructive"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  {t("actions.cancelReturn")}
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

      {/* Confirm Return Dialog */}
      <AlertDialog
        open={!!confirmDialog}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmReturn.title")}</AlertDialogTitle>
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

      {/* Cancel Return Dialog */}
      <AlertDialog
        open={!!cancelDialog}
        onOpenChange={(open) => !open && setCancelDialog(null)}
      >
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
    </>
  );
}
