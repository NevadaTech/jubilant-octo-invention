"use client";

import { useCallback, useMemo, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/ui/components/button";
import { Card, CardContent } from "@/ui/components/card";
import { SortableHeader } from "@/ui/components/sortable-header";
import { TablePagination } from "@/ui/components/table-pagination";
import { PageHeader } from "@/ui/layout/page-header";
import {
  useProducts,
  useProductFilters,
  useSetProductFilters,
} from "@/modules/inventory/presentation/hooks";
import { ProductFilters } from "./product-filters";
import { ProductReferenceThumb } from "./product-reference-photo";
import {
  CatalogEmpty,
  CatalogStatus,
  catalogPanel,
  catalogTextAction,
  type CatalogTone,
} from "./catalog-chrome";
import type { Product } from "@/modules/inventory/domain/entities/product.entity";
import type { ProductFilters as ProductFiltersType } from "@/modules/inventory/application/dto/product.dto";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";

function productTone(product: Product): { tone: CatalogTone; key: "active" | "inactive" | "lowStock" } {
  if (!product.isActive) return { tone: "muted", key: "inactive" };
  if (product.minStock > 0 && product.totalStock <= product.minStock) {
    return { tone: "warning", key: "lowStock" };
  }
  return { tone: "success", key: "active" };
}

function categoryLabel(product: Product): string {
  if (product.categories.length === 0) return "—";
  return product.categories.map((category) => category.name).join(", ");
}

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function ProductActions({ product }: { product: Product }) {
  const t = useTranslations("inventory.products");

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/dashboard/inventory/products/${product.id}`}
        className={catalogTextAction}
      >
        {t("actions.view")}
      </Link>
      <Link
        href={`/dashboard/inventory/products/${product.id}/edit`}
        className={catalogTextAction}
      >
        {t("actions.edit")}
      </Link>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("inventory.products");
  const status = productTone(product);

  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ProductReferenceThumb
            productId={product.id}
            productName={product.name}
            imageUrl={product.imageUrl}
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{product.name}</p>
            <p className="font-mono text-sm text-foreground">{product.sku}</p>
          </div>
        </div>
        <CatalogStatus tone={status.tone}>{t(`status.${status.key}`)}</CatalogStatus>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {product.sku} · {formatCurrency(product.price)} · {product.brandName || "—"} ·{" "}
        {categoryLabel(product)} · {t("fields.stock").toLowerCase()} {product.totalStock}
      </p>
      <div className="mt-3">
        <ProductActions product={product} />
      </div>
    </article>
  );
}

function ProductRow({ product }: { product: Product }) {
  const t = useTranslations("inventory.products");
  const status = productTone(product);

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-3 py-3 font-mono text-sm text-foreground">
        <div>{product.sku}</div>
        {product.barcode ? (
          <div aria-label={t("fields.barcode")}>{product.barcode}</div>
        ) : null}
      </td>
      <td className="px-3 py-3 text-sm text-foreground">
        <Link
          href={`/dashboard/inventory/products/${product.id}`}
          className="font-medium hover:underline"
        >
          {product.name}
        </Link>
      </td>
      <td className="px-3 py-3 text-sm text-foreground">{product.brandName || "—"}</td>
      <td className="px-3 py-3 text-sm text-foreground">{categoryLabel(product)}</td>
      <td className="px-3 py-3 text-sm text-foreground">{product.totalStock}</td>
      <td className="px-3 py-3 text-sm text-foreground">
        {product.price == null || product.price === 0
          ? "N/A"
          : formatCurrency(product.price)}
      </td>
      <td className="px-3 py-3">
        <CatalogStatus tone={status.tone}>{t(`status.${status.key}`)}</CatalogStatus>
      </td>
      <td className="px-3 py-3">
        <ProductActions product={product} />
      </td>
    </tr>
  );
}

function ProductListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          // eslint-disable-next-line @eslint-react/no-array-index-key
          key={i}
          className="h-16 animate-pulse rounded-xl bg-muted"
        />
      ))}
    </div>
  );
}

function EmptyState() {
  const t = useTranslations("inventory.products");

  return (
    <div className={catalogPanel}>
      <CatalogEmpty
        title={t("empty.title")}
        description={t("empty.description")}
        action={
          <Button asChild>
            <Link href="/dashboard/inventory/products/new">{t("actions.new")}</Link>
          </Button>
        }
      />
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

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleFiltersChange = useCallback(
    (newFilters: ProductFiltersType) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        setFilters(newFilters);
      }, 300);
    },
    [setFilters],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

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
      <Card className="shadow-none">
        <CardContent className="py-8">
          <div className="text-center text-destructive">
            {t("error.loading")}: {error?.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("list.title")}
        description={t("description")}
        action={
          <Button asChild>
            <Link href="/dashboard/inventory/products/new">{t("actions.new")}</Link>
          </Button>
        }
      />

      <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {isLoading ? (
        <ProductListSkeleton />
      ) : !data?.data.length ? (
        <EmptyState />
      ) : (
        <>
          <div className={`${catalogPanel} hidden lg:block`}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/70 text-left text-xs font-semibold text-muted-foreground">
                  <SortableHeader
                    label={t("fields.sku")}
                    field="sku"
                    currentSortBy={filters.sortBy}
                    currentSortOrder={filters.sortOrder}
                    onSort={handleSort}
                    className="px-3 py-3"
                  />
                  <SortableHeader
                    label={t("fields.name")}
                    field="name"
                    currentSortBy={filters.sortBy}
                    currentSortOrder={filters.sortOrder}
                    onSort={handleSort}
                    className="px-3 py-3"
                  />
                  <th className="px-3 py-3">{t("fields.brand")}</th>
                  <th className="px-3 py-3">{t("fields.category")}</th>
                  <th className="px-3 py-3">{t("fields.stock")}</th>
                  <th className="px-3 py-3">{t("fields.price")}</th>
                  <SortableHeader
                    label={t("fields.status")}
                    field="status"
                    currentSortBy={filters.sortBy}
                    currentSortOrder={filters.sortOrder}
                    onSort={handleSort}
                    className="px-3 py-3"
                  />
                  <th className="px-3 py-3">{tCommon("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 lg:hidden">
            {data.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
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
            allLabel={tCommon("pagination.all")}
          />
        </>
      )}
    </div>
  );
}
