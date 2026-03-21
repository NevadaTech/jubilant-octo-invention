"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Layers, Plus, Edit, Eye, Ban } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";
import { TablePagination } from "@/ui/components/table-pagination";
import { ConfirmDeleteDialog } from "@/ui/components/confirm-delete-dialog";
import { PermissionGate } from "@/shared/presentation/components/permission-gate";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  useCombos,
  useDeactivateCombo,
} from "@/modules/inventory/presentation/hooks/use-combos";
import { ComboFilters } from "./combo-filters";
import { formatDateShort } from "@/lib/date";
import type { Combo } from "@/modules/inventory/domain/entities/combo.entity";
import type { GetCombosQueryDto } from "@/modules/inventory/application/dto/combo.dto";

function formatCurrency(amount: number, currency = "COP"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ComboRow({
  combo,
  onDeactivate,
}: {
  combo: Combo;
  onDeactivate: (id: string) => void;
}) {
  const t = useTranslations("inventory.combos");

  return (
    <tr className="border-b border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-primary-50/50 dark:hover:bg-primary-950/20">
      <td className="px-4 py-3 text-sm text-foreground">{combo.sku}</td>
      <td className="px-4 py-3">
        <Link
          href={`/dashboard/inventory/combos/${combo.id}`}
          className="hover:opacity-80"
        >
          <p className="font-medium text-foreground">{combo.name}</p>
        </Link>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-foreground">
        {formatCurrency(combo.price, combo.currency)}
      </td>
      <td className="px-4 py-3">
        <Badge variant={combo.isActive ? "success" : "secondary"}>
          {combo.isActive ? t("status.active") : t("status.inactive")}
        </Badge>
      </td>
      <td className="hidden px-4 py-3 text-sm text-foreground md:table-cell">
        {combo.items.length}
      </td>
      <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">
        {formatDateShort(combo.createdAt)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
            <Link href={`/dashboard/inventory/combos/${combo.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <PermissionGate permission={PERMISSIONS.COMBOS_UPDATE}>
            <Button
              asChild
              variant="ghost"
              size="icon"
              title={t("actions.edit")}
            >
              <Link href={`/dashboard/inventory/combos/${combo.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.COMBOS_DELETE}>
            {combo.isActive && (
              <Button
                variant="ghost"
                size="icon"
                title={t("actions.deactivate")}
                onClick={() => onDeactivate(combo.id)}
              >
                <Ban className="h-4 w-4" />
              </Button>
            )}
          </PermissionGate>
        </div>
      </td>
    </tr>
  );
}

function ComboListSkeleton() {
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
  const t = useTranslations("inventory.combos");

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Layers className="mb-4 h-12 w-12 text-neutral-400 dark:text-neutral-500" />
      <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-neutral-100">
        {t("empty.title")}
      </h3>
      <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
        {t("empty.description")}
      </p>
      <Button asChild>
        <Link href="/dashboard/inventory/combos/new">
          <Plus className="mr-2 h-4 w-4" />
          {t("actions.new")}
        </Link>
      </Button>
    </div>
  );
}

export function ComboList() {
  const t = useTranslations("inventory.combos");
  const tCommon = useTranslations("common");
  const [filters, setFilters] = useState<GetCombosQueryDto>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading, isError, error } = useCombos(filters);
  const deactivateCombo = useDeactivateCombo();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleFiltersChange = useCallback((newFilters: GetCombosQueryDto) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (size: number) => {
    setFilters((prev) => ({ ...prev, limit: size, page: 1 }));
  };

  const handleDeactivate = (id: string) => {
    setConfirmId(id);
  };

  const handleConfirmDeactivate = () => {
    if (confirmId) {
      deactivateCombo.mutate(confirmId);
      setConfirmId(null);
    }
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
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl">{t("list.title")}</CardTitle>
          <PermissionGate permission={PERMISSIONS.COMBOS_CREATE}>
            <Button asChild>
              <Link href="/dashboard/inventory/combos/new">
                <Plus className="mr-2 h-4 w-4" />
                {t("actions.new")}
              </Link>
            </Button>
          </PermissionGate>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="mb-6">
            <ComboFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Table */}
          {isLoading ? (
            <ComboListSkeleton />
          ) : !data?.data.length ? (
            <EmptyState />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-sm font-medium text-muted-foreground">
                      <th className="px-4 py-3">{t("fields.sku")}</th>
                      <th className="px-4 py-3">{t("fields.name")}</th>
                      <th className="px-4 py-3">{t("fields.price")}</th>
                      <th className="px-4 py-3">{t("fields.status")}</th>
                      <th className="hidden px-4 py-3 md:table-cell">
                        {t("fields.items")}
                      </th>
                      <th className="hidden px-4 py-3 lg:table-cell">
                        {t("fields.createdAt")}
                      </th>
                      <th className="px-4 py-3">{tCommon("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((combo) => (
                      <ComboRow
                        key={combo.id}
                        combo={combo}
                        onDeactivate={handleDeactivate}
                      />
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

      <ConfirmDeleteDialog
        open={confirmId !== null}
        onOpenChange={(open) => !open && setConfirmId(null)}
        onConfirm={handleConfirmDeactivate}
        title={t("confirm.deactivate.title")}
        description={t("confirm.deactivate.description")}
        isLoading={deactivateCombo.isPending}
      />
    </>
  );
}
