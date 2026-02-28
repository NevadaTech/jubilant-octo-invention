"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Plus,
  Search,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Skeleton } from "@/ui/components/skeleton";
import { TablePagination } from "@/ui/components/table-pagination";
import { SortableHeader } from "@/ui/components/sortable-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  useMovements,
  usePostMovement,
  useVoidMovement,
  useDeleteMovement,
} from "@/modules/inventory/presentation/hooks/use-movements";
import { MovementTypeBadge } from "./movement-type-badge";
import { MovementStatusBadge } from "./movement-status-badge";
import { MovementFilters } from "./movement-filters";
import { MovementForm } from "./movement-form";
import type { StockMovementFilters } from "@/modules/inventory/application/dto/stock-movement.dto";
import type { StockMovement } from "@/modules/inventory/domain/entities/stock-movement.entity";

export function MovementList() {
  const t = useTranslations("inventory.movements");
  const tCommon = useTranslations("common");
  const [filters, setFilters] = useState<StockMovementFilters>({
    page: 1,
    limit: 10,
  });
  const [searchValue, setSearchValue] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [postConfirm, setPostConfirm] = useState<StockMovement | null>(null);
  const [voidConfirm, setVoidConfirm] = useState<StockMovement | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<StockMovement | null>(
    null,
  );

  const { data, isLoading, isError } = useMovements(filters);
  const postMovement = usePostMovement();
  const voidMovement = useVoidMovement();
  const deleteMovement = useDeleteMovement();

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handlePageSizeChange = (size: number) => {
    setFilters((prev) => ({ ...prev, limit: size, page: 1 }));
  };

  const handleSort = (field: string, order: "asc" | "desc" | undefined) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: order ? (field as StockMovementFilters["sortBy"]) : undefined,
      sortOrder: order,
      page: 1,
    }));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const handlePost = async () => {
    if (!postConfirm) return;
    try {
      await postMovement.mutateAsync(postConfirm.id);
      setPostConfirm(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleVoid = async () => {
    if (!voidConfirm) return;
    try {
      await voidMovement.mutateAsync(voidConfirm.id);
      setVoidConfirm(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteMovement.mutateAsync(deleteConfirm.id);
      setDeleteConfirm(null);
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
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("actions.new")}
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
            <MovementFilters filters={filters} onFiltersChange={setFilters} />
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
              <ArrowRightLeft className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t("empty.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("empty.description")}
              </p>
              <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("actions.new")}
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                      <SortableHeader
                        label={t("fields.type")}
                        field="type"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("fields.status")}
                        field="status"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <th className="pb-3 pr-4">{t("fields.warehouse")}</th>
                      <th className="pb-3 pr-4">{t("fields.totalItems")}</th>
                      <th className="pb-3 pr-4">{t("fields.totalQuantity")}</th>
                      <th className="pb-3 pr-4">{t("fields.reference")}</th>
                      <SortableHeader
                        label={t("fields.createdAt")}
                        field="createdAt"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("fields.postedAt")}
                        field="postedAt"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <th className="pb-3 pr-4 text-right">
                        {tCommon("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((movement) => (
                      <tr key={movement.id} className="border-b">
                        <td className="py-4 pr-4">
                          <MovementTypeBadge type={movement.type} />
                        </td>
                        <td className="py-4 pr-4">
                          <MovementStatusBadge status={movement.status} />
                        </td>
                        <td className="py-4 pr-4">{movement.warehouseName}</td>
                        <td className="py-4 pr-4">
                          <span className="font-medium">
                            {movement.totalItems}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            {movement.totalItems === 1 ? "product" : "products"}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <span
                            className={
                              movement.isEntry
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }
                          >
                            {movement.isEntry ? "+" : "-"}
                            {movement.totalQuantity}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          {movement.reference ? (
                            <span className="font-mono text-sm">
                              {movement.reference}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-4 pr-4 text-sm text-muted-foreground">
                          {formatDate(movement.createdAt)}
                        </td>
                        <td className="py-4 pr-4 text-sm text-muted-foreground">
                          {movement.postedAt ? (
                            formatDate(movement.postedAt)
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/inventory/movements/${movement.id}`}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t("actions.view")}
                                </Link>
                              </DropdownMenuItem>
                              {movement.isDraft && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/dashboard/inventory/movements/${movement.id}/edit`}
                                    >
                                      <Pencil className="mr-2 h-4 w-4" />
                                      {t("actions.edit")}
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setPostConfirm(movement)}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {t("actions.post")}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setDeleteConfirm(movement)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("actions.delete")}
                                  </DropdownMenuItem>
                                </>
                              )}
                              {movement.canVoid && (
                                <DropdownMenuItem
                                  onClick={() => setVoidConfirm(movement)}
                                  className="text-destructive"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  {t("actions.void")}
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

              <TablePagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                total={data.pagination.total}
                limit={data.pagination.limit}
                onPageChange={(p) =>
                  setFilters((prev) => ({ ...prev, page: p }))
                }
                onPageSizeChange={handlePageSizeChange}
                showingLabel={tCommon("pagination.showing", {
                  from: (data.pagination.page - 1) * data.pagination.limit + 1,
                  to: Math.min(
                    data.pagination.page * data.pagination.limit,
                    data.pagination.total,
                  ),
                  total: data.pagination.total,
                })}
                perPageLabel={tCommon("pagination.perPage")}
              />
            </>
          )}
        </CardContent>
      </Card>

      <MovementForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDelete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMovement.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMovement.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMovement.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {deleteMovement.isPending
                ? tCommon("loading")
                : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Post Confirmation Dialog */}
      <AlertDialog
        open={!!postConfirm}
        onOpenChange={(open) => !open && setPostConfirm(null)}
      >
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
              onClick={handlePost}
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

      {/* Void Confirmation Dialog */}
      <AlertDialog
        open={!!voidConfirm}
        onOpenChange={(open) => !open && setVoidConfirm(null)}
      >
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
              onClick={handleVoid}
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
