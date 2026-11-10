"use client";

import { useState, useMemo, type ReactNode } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/ui/layout/page-header";
import {
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
import { Card, CardContent } from "@/ui/components/card";
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
import { formatDateTimeMedium } from "@/lib/date";
import { MovementTypeBadge } from "./movement-type-badge";
import { MovementStatusBadge } from "./movement-status-badge";
import { MovementFilters } from "./movement-filters";
import type { StockMovementFilters } from "@/modules/inventory/application/dto/stock-movement.dto";
import type { StockMovement } from "@/modules/inventory/domain/entities/stock-movement.entity";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";

const headCell = "px-5 py-3.5";
const bodyCell = "px-5 py-4 align-middle";

function MobileField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold leading-4 text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 text-sm text-foreground">{children}</div>
    </div>
  );
}

function MovementQuantity({ movement }: { movement: StockMovement }) {
  return (
    <span
      className={
        movement.isEntry
          ? "font-semibold text-green-600 dark:text-green-400"
          : "font-semibold text-red-600 dark:text-red-400"
      }
    >
      {movement.isEntry ? "+" : "-"}
      {movement.totalQuantity}
    </span>
  );
}

function MovementActions({
  movement,
  onPost,
  onVoid,
  onDelete,
}: {
  movement: StockMovement;
  onPost: (movement: StockMovement) => void;
  onVoid: (movement: StockMovement) => void;
  onDelete: (movement: StockMovement) => void;
}) {
  const t = useTranslations("inventory.movements");

  return (
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
          <Link href={`/dashboard/inventory/movements/${movement.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            {t("actions.view")}
          </Link>
        </DropdownMenuItem>
        {movement.isDraft && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/inventory/movements/${movement.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                {t("actions.edit")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPost(movement)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {t("actions.post")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(movement)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("actions.delete")}
            </DropdownMenuItem>
          </>
        )}
        {movement.canVoid && (
          <DropdownMenuItem
            onClick={() => onVoid(movement)}
            className="text-destructive"
          >
            <XCircle className="mr-2 h-4 w-4" />
            {t("actions.void")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MovementCard({
  movement,
  locale,
  onPost,
  onVoid,
  onDelete,
}: {
  movement: StockMovement;
  locale: string;
  onPost: (movement: StockMovement) => void;
  onVoid: (movement: StockMovement) => void;
  onDelete: (movement: StockMovement) => void;
}) {
  const t = useTranslations("inventory.movements");

  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-4">
          <MobileField label={t("fields.type")}>
            <MovementTypeBadge type={movement.type} />
          </MobileField>
          <MobileField label={t("fields.status")}>
            <MovementStatusBadge status={movement.status} />
          </MobileField>
        </div>
        <MovementActions
          movement={movement}
          onPost={onPost}
          onVoid={onVoid}
          onDelete={onDelete}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3.5">
        <MobileField label={t("fields.warehouse")}>
          {movement.warehouseName}
        </MobileField>
        <MobileField label={t("fields.supplier")}>
          {movement.contactName || (
            <span className="text-muted-foreground">-</span>
          )}
        </MobileField>
        <MobileField label={t("fields.totalItems")}>
          <span className="font-semibold">{movement.totalItems}</span>
        </MobileField>
        <MobileField label={t("fields.totalQuantity")}>
          <MovementQuantity movement={movement} />
        </MobileField>
        <MobileField label={t("fields.reference")}>
          {movement.reference ? (
            <span className="font-mono text-sm">{movement.reference}</span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </MobileField>
        <MobileField label={t("fields.createdAt")}>
          <span className="text-muted-foreground">
            {formatDateTimeMedium(movement.createdAt, locale)}
          </span>
        </MobileField>
        <MobileField label={t("fields.postedAt")}>
          {movement.postedAt ? (
            <span className="text-muted-foreground">
              {formatDateTimeMedium(movement.postedAt, locale)}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </MobileField>
      </div>
    </article>
  );
}

export function MovementList() {
  const t = useTranslations("inventory.movements");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [filters, setFilters] = useState<StockMovementFilters>({
    page: 1,
    limit: 10,
  });
  const [postConfirm, setPostConfirm] = useState<StockMovement | null>(null);
  const [voidConfirm, setVoidConfirm] = useState<StockMovement | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<StockMovement | null>(
    null,
  );

  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);
  const filtersWithCompany = useMemo(
    () =>
      selectedCompanyId
        ? { ...filters, companyId: selectedCompanyId }
        : filters,
    [filters, selectedCompanyId],
  );
  const { data, isLoading, isError } = useMovements(filtersWithCompany);
  const postMovement = usePostMovement();
  const voidMovement = useVoidMovement();
  const deleteMovement = useDeleteMovement();

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
      <div className="space-y-6">
        <PageHeader
          title={t("list.title")}
          description={t("description")}
          action={
            <Button asChild>
              <Link href="/dashboard/inventory/movements/new">
                {t("actions.new")}
              </Link>
            </Button>
          }
        />
        <MovementFilters filters={filters} onFiltersChange={setFilters} />
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              // eslint-disable-next-line @eslint-react/no-array-index-key
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
            <Button asChild variant="outline" className="mt-4">
              <Link href="/dashboard/inventory/movements/new">
                {t("actions.new")}
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-xl border border-border bg-card lg:block">
              <table className="w-full">
                <thead className="bg-muted/70 text-left text-xs font-semibold text-muted-foreground">
                  <tr>
                    <SortableHeader
                      label={t("fields.type")}
                      field="type"
                      currentSortBy={filters.sortBy}
                      currentSortOrder={filters.sortOrder}
                      onSort={handleSort}
                      className={headCell}
                    />
                    <SortableHeader
                      label={t("fields.status")}
                      field="status"
                      currentSortBy={filters.sortBy}
                      currentSortOrder={filters.sortOrder}
                      onSort={handleSort}
                      className={headCell}
                    />
                    <th className={headCell}>{t("fields.warehouse")}</th>
                    <th className={headCell}>{t("fields.supplier")}</th>
                    <th className={headCell}>{t("fields.totalItems")}</th>
                    <th className={headCell}>{t("fields.totalQuantity")}</th>
                    <th className={headCell}>{t("fields.reference")}</th>
                    <SortableHeader
                      label={t("fields.createdAt")}
                      field="createdAt"
                      currentSortBy={filters.sortBy}
                      currentSortOrder={filters.sortOrder}
                      onSort={handleSort}
                      className={headCell}
                    />
                    <SortableHeader
                      label={t("fields.postedAt")}
                      field="postedAt"
                      currentSortBy={filters.sortBy}
                      currentSortOrder={filters.sortOrder}
                      onSort={handleSort}
                      className={headCell}
                    />
                    <th className={`${headCell} text-right`}>
                      {tCommon("actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((movement) => (
                    <tr
                      key={movement.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className={bodyCell}>
                        <MovementTypeBadge type={movement.type} />
                      </td>
                      <td className={bodyCell}>
                        <MovementStatusBadge status={movement.status} />
                      </td>
                      <td className={bodyCell}>{movement.warehouseName}</td>
                      <td className={bodyCell}>
                        {movement.contactName || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className={bodyCell}>
                        <span className="font-semibold">
                          {movement.totalItems}
                        </span>
                      </td>
                      <td className={bodyCell}>
                        <MovementQuantity movement={movement} />
                      </td>
                      <td className={bodyCell}>
                        {movement.reference ? (
                          <span className="font-mono text-sm">
                            {movement.reference}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td
                        className={`${bodyCell} text-sm text-muted-foreground`}
                      >
                        {formatDateTimeMedium(movement.createdAt, locale)}
                      </td>
                      <td
                        className={`${bodyCell} text-sm text-muted-foreground`}
                      >
                        {movement.postedAt ? (
                          formatDateTimeMedium(movement.postedAt, locale)
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className={`${bodyCell} text-right`}>
                        <MovementActions
                          movement={movement}
                          onPost={setPostConfirm}
                          onVoid={setVoidConfirm}
                          onDelete={setDeleteConfirm}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 lg:hidden">
              {data.data.map((movement) => (
                <MovementCard
                  key={movement.id}
                  movement={movement}
                  locale={locale}
                  onPost={setPostConfirm}
                  onVoid={setVoidConfirm}
                  onDelete={setDeleteConfirm}
                />
              ))}
            </div>

            <TablePagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              limit={data.pagination.limit}
              onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
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
              allLabel={tCommon("pagination.all")}
            />
          </>
        )}
      </div>

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
