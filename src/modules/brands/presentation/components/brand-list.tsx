"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/components/button";
import { Card, CardContent } from "@/ui/components/card";
import { Skeleton } from "@/ui/components/skeleton";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
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
  useBrands,
  useDeleteBrand,
} from "@/modules/brands/presentation/hooks/use-brands";
import type { BrandFilters } from "@/modules/brands/application/dto/brand.dto";
import { BrandForm } from "./brand-form";
import {
  CatalogEmpty,
  CatalogStatus,
  catalogDangerAction,
  catalogFilterLabel,
  catalogPanel,
  catalogTextAction,
} from "@/modules/inventory/presentation/components/products/catalog-chrome";

export function BrandList() {
  const t = useTranslations("inventory.brands");
  const tCommon = useTranslations("common");

  const [filters, setFilters] = useState<BrandFilters>({
    page: 1,
    limit: 10,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<string | null>(null);

  const { data, isLoading, isError } = useBrands(filters);
  const deleteBrand = useDeleteBrand();

  const updateFilters = (patch: Partial<BrandFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleSort = (field: string, order: "asc" | "desc" | undefined) => {
    updateFilters({
      sortBy: order ? (field as BrandFilters["sortBy"]) : undefined,
      sortOrder: order,
      page: 1,
    });
  };

  const handleDelete = async () => {
    if (brandToDelete) {
      await deleteBrand.mutateAsync(brandToDelete);
      setDeleteDialogOpen(false);
      setBrandToDelete(null);
    }
  };

  const openEdit = (id: string) => {
    setEditId(id);
    setFormOpen(true);
  };

  const openCreate = () => {
    setEditId(null);
    setFormOpen(true);
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
          action={<Button onClick={openCreate}>{t("actions.new")}</Button>}
        />

        <div className="space-y-1 sm:w-64">
          <Label htmlFor="brand-search" className={catalogFilterLabel}>
            {tCommon("search")}
          </Label>
          <Input
            id="brand-search"
            placeholder={t("filters.search")}
            value={filters.search || ""}
            onChange={(e) => updateFilters({ search: e.target.value, page: 1 })}
            className="h-10"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => `skeleton-${i}`).map((key) => (
              <Skeleton key={key} className="h-16 w-full" />
            ))}
          </div>
        ) : !data?.data.length ? (
          <div className={catalogPanel}>
            <CatalogEmpty
              title={t("empty.title")}
              description={t("empty.description")}
              action={<Button onClick={openCreate}>{t("actions.new")}</Button>}
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
                    <th className="px-4 py-3">{t("fields.status")}</th>
                    <th className="px-4 py-3">{tCommon("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((brand) => (
                    <tr key={brand.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">{brand.name}</p>
                        {brand.description ? (
                          <p className="max-w-xs truncate text-sm text-muted-foreground">
                            {brand.description}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <CatalogStatus tone={brand.isActive ? "success" : "muted"}>
                          {brand.isActive ? t("status.active") : t("status.inactive")}
                        </CatalogStatus>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button type="button" className={catalogTextAction} onClick={() => openEdit(brand.id)}>
                            {t("actions.edit")}
                          </button>
                          <button
                            type="button"
                            className={catalogDangerAction}
                            onClick={() => {
                              setBrandToDelete(brand.id);
                              setDeleteDialogOpen(true);
                            }}
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
              {data.data.map((brand) => (
                <article key={brand.id} className="space-y-2 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-foreground">{brand.name}</p>
                    <CatalogStatus tone={brand.isActive ? "success" : "muted"}>
                      {brand.isActive ? t("status.active") : t("status.inactive")}
                    </CatalogStatus>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" className={catalogTextAction} onClick={() => openEdit(brand.id)}>
                      {t("actions.edit")}
                    </button>
                    <button
                      type="button"
                      className={catalogDangerAction}
                      onClick={() => {
                        setBrandToDelete(brand.id);
                        setDeleteDialogOpen(true);
                      }}
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
              onPageChange={(p) => updateFilters({ page: p })}
              onPageSizeChange={(size) => updateFilters({ limit: size, page: 1 })}
              showingLabel={tCommon("pagination.showing", {
                from: (data.pagination.page - 1) * data.pagination.limit + 1,
                to: Math.min(data.pagination.page * data.pagination.limit, data.pagination.total),
                total: data.pagination.total,
              })}
              perPageLabel={tCommon("pagination.perPage")}
              allLabel={tCommon("pagination.all")}
            />
          </>
        )}
      </div>

      <BrandForm open={formOpen} onOpenChange={setFormOpen} editId={editId} />

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
              {deleteBrand.isPending ? tCommon("loading") : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
