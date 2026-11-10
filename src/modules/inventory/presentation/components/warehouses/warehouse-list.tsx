"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Warehouse as WarehouseIcon } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Badge } from "@/ui/components/badge";
import { TablePagination } from "@/ui/components/table-pagination";
import { SortableHeader } from "@/ui/components/sortable-header";
import { PageHeader } from "@/ui/layout/page-header";
import {
  useWarehouses,
  useWarehouseFilters,
  useSetWarehouseFilters,
} from "@/modules/inventory/presentation/hooks";
import { WarehouseFiltersComponent } from "./warehouse-filters";
import type { Warehouse } from "@/modules/inventory/domain/entities/warehouse.entity";
import type { WarehouseFilters } from "@/modules/inventory/application/dto/warehouse.dto";

const rowClass =
  "flex flex-col gap-1 rounded-xl border border-border bg-card p-3.5 lg:table-row lg:rounded-none lg:border-0 lg:border-b lg:border-border lg:bg-transparent lg:p-0";
const cellClass = "px-0 py-0 text-sm text-foreground lg:px-3 lg:py-3";

function WarehouseRow({ warehouse }: { warehouse: Warehouse }) {
  const t = useTranslations("inventory.warehouses");

  return (
    <tr className={rowClass}>
      <td className={cellClass}>
        <Link
          href={`/dashboard/inventory/warehouses/${warehouse.id}`}
          className="hover:text-primary"
        >
          <p className="text-[15px] font-semibold text-foreground">
            {warehouse.name}
          </p>
          <p className="text-[13px] text-muted-foreground">{warehouse.code}</p>
        </Link>
      </td>
      <td className={`${cellClass} text-[13px] text-muted-foreground lg:text-sm lg:text-foreground`}>
        {warehouse.address ? warehouse.address : "N/A"}
      </td>
      <td className={cellClass}>
        <Badge
          variant={warehouse.isActive ? "success" : "secondary"}
          className="rounded-full px-2 py-0.5 text-xs font-semibold"
        >
          {warehouse.isActive ? t("status.active") : t("status.inactive")}
        </Badge>
      </td>
      <td className={cellClass}>
        <Link
          href={`/dashboard/inventory/warehouses/${warehouse.id}`}
          className="text-sm font-semibold text-primary"
        >
          {t("actions.view")}
        </Link>
      </td>
    </tr>
  );
}

function WarehouseListSkeleton() {
  return (
    <div className="space-y-3">
      {["a", "b", "c", "d", "e"].map((key) => (
        <div
          key={key}
          className="h-16 animate-pulse rounded-xl border border-border bg-muted/40"
        />
      ))}
    </div>
  );
}

function EmptyState() {
  const t = useTranslations("inventory.warehouses");

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <WarehouseIcon className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="mb-2 text-lg font-medium text-foreground">
        {t("empty.title")}
      </h3>
      <p className="text-sm text-muted-foreground">{t("empty.description")}</p>
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
      <div className="rounded-xl border border-border bg-card px-4 py-8 text-center text-destructive">
        {t("error.loading")}: {error?.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("list.title")}
        description={t("description")}
        action={
          <Button asChild>
            <Link href="/dashboard/inventory/warehouses/new">
              {t("actions.new")}
            </Link>
          </Button>
        }
      />

      <WarehouseFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
      />

      {isLoading ? (
        <WarehouseListSkeleton />
      ) : !data?.data.length ? (
        <EmptyState />
      ) : (
        <>
          <div className="lg:overflow-hidden lg:rounded-xl lg:border lg:border-border lg:bg-card">
            <table className="w-full">
              <thead className="hidden bg-muted/70 text-xs font-semibold text-muted-foreground lg:table-header-group">
                <tr className="h-10 text-left">
                  <SortableHeader
                    label={t("fields.warehouse")}
                    field="name"
                    currentSortBy={filters.sortBy}
                    currentSortOrder={filters.sortOrder}
                    onSort={handleSort}
                    className="px-3"
                  />
                  <th className="px-3">{t("fields.address")}</th>
                  <SortableHeader
                    label={t("fields.status")}
                    field="isActive"
                    currentSortBy={filters.sortBy}
                    currentSortOrder={filters.sortOrder}
                    onSort={handleSort}
                    className="px-3"
                  />
                  <th className="px-3">{tCommon("actions")}</th>
                </tr>
              </thead>
              <tbody className="flex flex-col gap-3 lg:table-row-group">
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
            allLabel={tCommon("pagination.all")}
          />
        </>
      )}
    </div>
  );
}
