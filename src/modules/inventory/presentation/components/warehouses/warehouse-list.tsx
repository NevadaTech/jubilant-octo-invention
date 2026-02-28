"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Warehouse as WarehouseIcon,
  Plus,
  Edit,
  Eye,
  MapPin,
} from "lucide-react";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";
import { TablePagination } from "@/ui/components/table-pagination";
import { SortableHeader } from "@/ui/components/sortable-header";
import {
  useWarehouses,
  useWarehouseFilters,
  useSetWarehouseFilters,
} from "@/modules/inventory/presentation/hooks";
import { WarehouseFiltersComponent } from "./warehouse-filters";
import type { Warehouse } from "@/modules/inventory/domain/entities/warehouse.entity";
import type { WarehouseFilters } from "@/modules/inventory/application/dto/warehouse.dto";

function WarehouseRow({ warehouse }: { warehouse: Warehouse }) {
  const t = useTranslations("inventory.warehouses");

  return (
    <tr className="border-b border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-primary-50/50 dark:hover:bg-primary-950/20">
      <td className="px-4 py-3">
        <Link
          href={`/dashboard/inventory/warehouses/${warehouse.id}`}
          className="flex items-center gap-3 hover:opacity-80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <WarehouseIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-foreground">{warehouse.name}</p>
            <p className="text-sm text-muted-foreground">{warehouse.code}</p>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3">
        {warehouse.address ? (
          <div className="flex items-center gap-2 text-sm text-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate max-w-xs">{warehouse.address}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">N/A</span>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge variant={warehouse.isActive ? "success" : "secondary"}>
          {warehouse.isActive ? t("status.active") : t("status.inactive")}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
            <Link href={`/dashboard/inventory/warehouses/${warehouse.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" title={t("actions.edit")}>
            <Link href={`/dashboard/inventory/warehouses/${warehouse.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </td>
    </tr>
  );
}

function WarehouseListSkeleton() {
  return (
    <div className="space-y-4">
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
    </div>
  );
}

function EmptyState() {
  const t = useTranslations("inventory.warehouses");

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <WarehouseIcon className="mb-4 h-12 w-12 text-neutral-400 dark:text-neutral-500" />
      <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">
        {t("empty.title")}
      </h3>
      <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
        {t("empty.description")}
      </p>
      <Button asChild>
        <Link href="/dashboard/inventory/warehouses/new">
          <Plus className="mr-2 h-4 w-4" />
          {t("actions.new")}
        </Link>
      </Button>
    </div>
  );
}

export function WarehouseList() {
  const t = useTranslations("inventory.warehouses");
  const tCommon = useTranslations("common");
  const filters = useWarehouseFilters();
  const setFilters = useSetWarehouseFilters();
  const { data, isLoading, isError, error } = useWarehouses(filters);

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

  const handlePageSizeChange = (size: number) => {
    setFilters({ limit: size, page: 1 });
  };

  const handleSort = (field: string, order: "asc" | "desc" | undefined) => {
    setFilters({
      sortBy: order ? (field as WarehouseFilters["sortBy"]) : undefined,
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">{t("list.title")}</CardTitle>
        <Button asChild>
          <Link href="/dashboard/inventory/warehouses/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("actions.new")}
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <WarehouseFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <WarehouseListSkeleton />
        ) : !data?.data.length ? (
          <EmptyState />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm font-medium text-muted-foreground">
                    <SortableHeader
                      label={t("fields.warehouse")}
                      field="name"
                      currentSortBy={filters.sortBy}
                      currentSortOrder={filters.sortOrder}
                      onSort={handleSort}
                      className="px-4 py-3"
                    />
                    <th className="px-4 py-3">{t("fields.address")}</th>
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
                  {data.data.map((warehouse) => (
                    <WarehouseRow key={warehouse.id} warehouse={warehouse} />
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
