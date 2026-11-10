"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/components/button";
import { Card, CardContent } from "@/ui/components/card";
import { Skeleton } from "@/ui/components/skeleton";
import { TablePagination } from "@/ui/components/table-pagination";
import { SortableHeader } from "@/ui/components/sortable-header";
import { PageHeader } from "@/ui/layout/page-header";
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
  useCategories,
  useDeleteCategory,
} from "@/modules/inventory/presentation/hooks/use-categories";
import {
  useCategoryFilters,
  useSetCategoryFilters,
  useCategoryFormState,
} from "@/modules/inventory/presentation/hooks/use-inventory-store";
import type { CategoryFilters } from "@/modules/inventory/application/dto/category.dto";
import { CategoryFiltersComponent } from "./category-filters";
import { CategoryForm } from "./category-form";
import {
  CatalogEmpty,
  CatalogStatus,
  catalogDangerAction,
  catalogPanel,
  catalogTextAction,
} from "../products/catalog-chrome";

export function CategoryList() {
  const t = useTranslations("inventory.categories");
  const tCommon = useTranslations("common");
  const filters = useCategoryFilters();
  const setFilters = useSetCategoryFilters();
  const { open } = useCategoryFormState();
  const { data, isLoading, isError } = useCategories(filters);
  const deleteCategory = useDeleteCategory();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handlePageSizeChange = (size: number) => {
    setFilters({ limit: size, page: 1 });
  };

  const handleSort = (field: string, order: "asc" | "desc" | undefined) => {
    setFilters({
      sortBy: order ? (field as CategoryFilters["sortBy"]) : undefined,
      sortOrder: order,
      page: 1,
    });
  };

  const handleDelete = async () => {
    if (categoryToDelete) {
      await deleteCategory.mutateAsync(categoryToDelete);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  if (isError) {
    return (
      <Card className="shadow-none">
        <CardContent className="py-10 text-center">
          <p className="text-destructive">{t("error.loading")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <PageHeader
          title={t("list.title")}
          description={t("description")}
          action={<Button onClick={() => open()}>{t("actions.new")}</Button>}
        />
        <CategoryFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
        />

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              // eslint-disable-next-line @eslint-react/no-array-index-key
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !data?.data.length ? (
          <div className={catalogPanel}>
            <CatalogEmpty
              title={t("empty.title")}
              description={t("empty.description")}
              action={<Button onClick={() => open()}>{t("actions.new")}</Button>}
            />
          </div>
        ) : (
          <>
            <div className={`${catalogPanel} hidden lg:block`}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/70 text-left text-xs font-semibold text-muted-foreground">
                    <SortableHeader
                      label={t("fields.name")}
                      field="name"
                      currentSortBy={filters.sortBy}
                      currentSortOrder={filters.sortOrder}
                      onSort={handleSort}
                      className="px-4 py-3"
                    />
                    <th className="px-4 py-3">{t("fields.parent")}</th>
                    <SortableHeader
                      label={t("fields.products")}
                      field="productCount"
                      currentSortBy={filters.sortBy}
                      currentSortOrder={filters.sortOrder}
                      onSort={handleSort}
                      className="px-4 py-3"
                    />
                    <SortableHeader
                      label={t("fields.status")}
                      field="isActive"
                      currentSortBy={filters.sortBy}
                      currentSortOrder={filters.sortOrder}
                      onSort={handleSort}
                      className="px-4 py-3"
                    />
                    <th className="px-4 py-3">{tCommon("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((category) => (
                    <tr key={category.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">
                          {category.name}
                        </p>
                        {category.description ? (
                          <p className="max-w-xs truncate text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {category.parentName || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        <span>{category.productCount}</span>{" "}
                        {t("fields.products").toLowerCase()}
                      </td>
                      <td className="px-4 py-3">
                        <CatalogStatus tone={category.isActive ? "success" : "muted"}>
                          {category.isActive ? t("status.active") : t("status.inactive")}
                        </CatalogStatus>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className={catalogTextAction}
                            onClick={() => open(category.id)}
                          >
                            {t("actions.edit")}
                          </button>
                          <button
                            type="button"
                            className={`${catalogDangerAction} disabled:pointer-events-none disabled:opacity-40`}
                            onClick={() => openDeleteDialog(category.id)}
                            disabled={category.productCount > 0}
                          >
                            {tCommon("delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 lg:hidden">
              {data.data.map((category) => (
                <article
                  key={category.id}
                  className="space-y-2 rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-foreground">{category.name}</p>
                    <CatalogStatus tone={category.isActive ? "success" : "muted"}>
                      {category.isActive ? t("status.active") : t("status.inactive")}
                    </CatalogStatus>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {category.productCount} {t("fields.products").toLowerCase()}
                    {category.parentName ? ` · ${category.parentName}` : ""}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className={catalogTextAction}
                      onClick={() => open(category.id)}
                    >
                      {t("actions.edit")}
                    </button>
                    <button
                      type="button"
                      className={`${catalogDangerAction} disabled:pointer-events-none disabled:opacity-40`}
                      onClick={() => openDeleteDialog(category.id)}
                      disabled={category.productCount > 0}
                    >
                      {tCommon("delete")}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <TablePagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              limit={data.pagination.limit}
              onPageChange={(p) => setFilters({ page: p })}
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

      <CategoryForm />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="shadow-none">
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("delete.description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCategory.isPending ? tCommon("loading") : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
