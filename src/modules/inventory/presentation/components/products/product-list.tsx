"use client";

import { useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Package, Plus, Edit, Eye } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";
import { SortableHeader } from "@/ui/components/sortable-header";
import { TablePagination } from "@/ui/components/table-pagination";
import {
  useProducts,
  useProductFilters,
  useSetProductFilters,
} from "@/modules/inventory/presentation/hooks";
import { ProductFilters } from "./product-filters";
import type { Product } from "@/modules/inventory/domain/entities/product.entity";
import type { ProductFilters as ProductFiltersType } from "@/modules/inventory/application/dto/product.dto";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || amount === 0) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function ProductRow({ product }: { product: Product }) {
  const t = useTranslations("inventory.products");

  return (
    <tr className="border-b border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-primary-50/50 dark:hover:bg-primary-950/20">
      <td className="px-4 py-3">
        <Link
          href={`/dashboard/inventory/products/${product.id}`}
          className="flex items-center gap-3 hover:opacity-80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <Package className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-foreground">{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.sku}</p>
          </div>
        </Link>
      </td>
      <td className="hidden px-4 py-3 text-sm text-foreground md:table-cell">
        {product.categories.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {product.categories.map((c) => (
              <Badge key={c.id} variant="outline" className="text-xs">
                {c.name}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-foreground">
        {formatCurrency(product.price)}
      </td>
      <td className="px-4 py-3">
        <Badge variant={product.isActive ? "success" : "secondary"}>
          {product.isActive ? t("status.active") : t("status.inactive")}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
            <Link href={`/dashboard/inventory/products/${product.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" title={t("actions.edit")}>
            <Link href={`/dashboard/inventory/products/${product.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </td>
    </tr>
  );
}

function ProductListSkeleton() {
  return (
    <div className="space-y-4">
      {/* eslint-disable @eslint-react/no-array-index-key */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
        >
          <div className="h-10 w-10 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
        </div>
      ))}
      {/* eslint-enable @eslint-react/no-array-index-key */}
    </div>
  );
}

function EmptyState() {
  const t = useTranslations("inventory.products");

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Package className="mb-4 h-12 w-12 text-neutral-400 dark:text-neutral-500" />
      <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">
        {t("empty.title")}
      </h3>
      <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
        {t("empty.description")}
      </p>
      <Button asChild>
        <Link href="/dashboard/inventory/products/new">
          <Plus className="mr-2 h-4 w-4" />
          {t("actions.new")}
        </Link>
      </Button>
    </div>
  );
}

export function ProductList() {
  const t = useTranslations("inventory.products");
  const tCommon = useTranslations("common");
  const filters = useProductFilters();
  const setFilters = useSetProductFilters();
  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);
  const filtersWithCompany = useMemo(
    () =>
      selectedCompanyId
        ? { ...filters, companyId: selectedCompanyId }
        : filters,
    [filters, selectedCompanyId],
  );
  const { data, isLoading, isError, error } = useProducts(filtersWithCompany);

  const handleFiltersChange = useCallback(
    (newFilters: ProductFiltersType) => {
      setFilters(newFilters);
    },
    [setFilters],
  );

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

  const handlePageSizeChange = (size: number) => {
    setFilters({ limit: size, page: 1 });
  };

  const handleSort = (field: string, order: "asc" | "desc" | undefined) => {
    setFilters({
      sortBy: order ? (field as ProductFiltersType["sortBy"]) : undefined,
      sortOrder: order,
      page: 1,
    });
  };

  if (isError) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">
            {t("error.loading")}: {error?.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-xl">{t("list.title")}</CardTitle>
        <Button asChild>
          <Link href="/dashboard/inventory/products/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("actions.new")}
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="mb-6">
          <ProductFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <ProductListSkeleton />
        ) : !data?.data.length ? (
          <EmptyState />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm font-medium text-muted-foreground">
                    <SortableHeader
                      label={t("fields.product")}
                      field="name"
                      currentSortBy={filters.sortBy}
                      currentSortOrder={filters.sortOrder}
                      onSort={handleSort}
                      className="px-4 py-3"
                    />
                    <th className="hidden px-4 py-3 md:table-cell">
                      {t("fields.category")}
                    </th>
                    <SortableHeader
                      label={t("fields.price")}
                      field="price"
                      currentSortBy={filters.sortBy}
                      currentSortOrder={filters.sortOrder}
                      onSort={handleSort}
                      className="px-4 py-3"
                    />
                    <SortableHeader
                      label={t("fields.status")}
                      field="status"
                      currentSortBy={filters.sortBy}
                      currentSortOrder={filters.sortOrder}
                      onSort={handleSort}
                      className="px-4 py-3"
                    />
                    <th className="px-4 py-3">{tCommon("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((product) => (
                    <ProductRow key={product.id} product={product} />
                  ))}
                </tbody>
              </table>
            </div>

            <TablePagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              limit={data.pagination.limit}
              onPageChange={handlePageChange}
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
  );
}
