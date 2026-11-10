"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/ui/components/button";
import { Card, CardContent } from "@/ui/components/card";
import { TablePagination } from "@/ui/components/table-pagination";
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
import { PermissionGate } from "@/shared/presentation/components/permission-gate";
import { PERMISSIONS } from "@/shared/domain/permissions";
import {
  useCombos,
  useDeactivateCombo,
} from "@/modules/inventory/presentation/hooks/use-combos";
import { ComboFilters } from "./combo-filters";
import { formatDateShort } from "@/lib/date";
import {
  CatalogEmpty,
  CatalogStatus,
  catalogDangerAction,
  catalogPanel,
  catalogTextAction,
} from "../products/catalog-chrome";
import type { Combo } from "@/modules/inventory/domain/entities/combo.entity";
import type { GetCombosQueryDto } from "@/modules/inventory/application/dto/combo.dto";

function formatCurrency(amount: number, currency = "COP"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ComboActions({
  combo,
  onDeactivate,
}: {
  combo: Combo;
  onDeactivate: (id: string) => void;
}) {
  const t = useTranslations("inventory.combos");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href={`/dashboard/inventory/combos/${combo.id}`} className={catalogTextAction}>
        {t("actions.view")}
      </Link>
      <PermissionGate permission={PERMISSIONS.COMBOS_UPDATE}>
        <Link
          href={`/dashboard/inventory/combos/${combo.id}/edit`}
          className={catalogTextAction}
        >
          {t("actions.edit")}
        </Link>
      </PermissionGate>
      <PermissionGate permission={PERMISSIONS.COMBOS_DELETE}>
        {combo.isActive ? (
          <button
            type="button"
            className={catalogDangerAction}
            onClick={() => onDeactivate(combo.id)}
          >
            {t("actions.deactivate")}
          </button>
        ) : null}
      </PermissionGate>
    </div>
  );
}

function ComboListSkeleton() {
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

  const handleConfirmDeactivate = () => {
    if (confirmId) {
      deactivateCombo.mutate(confirmId);
      setConfirmId(null);
    }
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
    <>
      <div className="space-y-4">
        <PageHeader
          title={t("list.title")}
          description={t("description")}
          action={
            <PermissionGate permission={PERMISSIONS.COMBOS_CREATE}>
              <Button asChild>
                <Link href="/dashboard/inventory/combos/new">{t("actions.new")}</Link>
              </Button>
            </PermissionGate>
          }
        />

        <ComboFilters filters={filters} onFiltersChange={handleFiltersChange} />

        {isLoading ? (
          <ComboListSkeleton />
        ) : !data?.data.length ? (
          <div className={catalogPanel}>
            <CatalogEmpty
              title={t("empty.title")}
              description={t("empty.description")}
              action={
                <PermissionGate permission={PERMISSIONS.COMBOS_CREATE}>
                  <Button asChild>
                    <Link href="/dashboard/inventory/combos/new">{t("actions.new")}</Link>
                  </Button>
                </PermissionGate>
              }
            />
          </div>
        ) : (
          <>
            <div className={`${catalogPanel} hidden lg:block`}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/70 text-left text-xs font-semibold text-muted-foreground">
                    <th className="px-3 py-3">{t("fields.sku")}</th>
                    <th className="px-3 py-3">{t("fields.name")}</th>
                    <th className="px-3 py-3">{t("fields.price")}</th>
                    <th className="px-3 py-3">{t("fields.status")}</th>
                    <th className="px-3 py-3">{t("fields.items")}</th>
                    <th className="px-3 py-3">{t("fields.createdAt")}</th>
                    <th className="px-3 py-3">{tCommon("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((combo) => (
                    <tr key={combo.id} className="border-b border-border last:border-b-0">
                      <td className="px-3 py-3 font-mono text-sm text-foreground">{combo.sku}</td>
                      <td className="px-3 py-3 text-sm font-semibold text-foreground">
                        <Link href={`/dashboard/inventory/combos/${combo.id}`} className="hover:underline">
                          {combo.name}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-sm text-foreground">
                        {formatCurrency(combo.price, combo.currency)}
                      </td>
                      <td className="px-3 py-3">
                        <CatalogStatus tone={combo.isActive ? "success" : "muted"}>
                          {combo.isActive ? t("status.active") : t("status.inactive")}
                        </CatalogStatus>
                      </td>
                      <td className="px-3 py-3 text-sm text-foreground">{combo.items.length}</td>
                      <td className="px-3 py-3 text-sm text-muted-foreground">
                        {formatDateShort(combo.createdAt)}
                      </td>
                      <td className="px-3 py-3">
                        <ComboActions combo={combo} onDeactivate={setConfirmId} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 lg:hidden">
              {data.data.map((combo) => (
                <article key={combo.id} className="space-y-2 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{combo.name}</p>
                      <p className="font-mono text-sm text-muted-foreground">
                        {combo.sku} · {formatCurrency(combo.price, combo.currency)}
                      </p>
                    </div>
                    <CatalogStatus tone={combo.isActive ? "success" : "muted"}>
                      {combo.isActive ? t("status.active") : t("status.inactive")}
                    </CatalogStatus>
                  </div>
                  <ComboActions combo={combo} onDeactivate={setConfirmId} />
                </article>
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
                to: Math.min(data.pagination.page * data.pagination.limit, data.pagination.total),
                total: data.pagination.total,
              })}
              perPageLabel={tCommon("pagination.perPage")}
              allLabel={tCommon("pagination.all")}
            />
          </>
        )}
      </div>

      <AlertDialog open={confirmId !== null} onOpenChange={(open) => !open && setConfirmId(null)}>
        <AlertDialogContent className="shadow-none">
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle>{t("confirm.deactivate.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirm.deactivate.description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateCombo.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deactivateCombo.isPending}
              onClick={(event) => {
                event.preventDefault();
                handleConfirmDeactivate();
              }}
            >
              {t("actions.deactivate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
