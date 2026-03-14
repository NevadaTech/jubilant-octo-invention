"use client";

import { useState, useCallback, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDateTimeShort } from "@/lib/date";
import { ClipboardList, Eye, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Skeleton } from "@/ui/components/skeleton";
import { TablePagination } from "@/ui/components/table-pagination";
import { SortableHeader } from "@/ui/components/sortable-header";
import { useAuditLogs } from "@/modules/audit/presentation/hooks/use-audit-logs";
import { useUsers } from "@/modules/users/presentation/hooks/use-users";
import { usePermissions } from "@/modules/authentication/presentation/hooks/use-permissions";
import { PERMISSIONS } from "@/shared/domain/permissions";
import { getContainer } from "@/config/di/container";
import { AuditLogFiltersBar } from "./audit-log-filters";
import { AuditLogDetailDialog } from "./audit-log-detail-dialog";
import { AuditActionBadge } from "./audit-action-badge";
import { AuditMethodBadge } from "./audit-method-badge";
import { AuditStatusIndicator } from "./audit-status-indicator";
import type { AuditLogFilters } from "@/modules/audit/application/dto/audit-log.dto";
import type { AuditLog } from "@/modules/audit/domain/entities/audit-log.entity";

export function AuditLogList() {
  const locale = useLocale();
  const t = useTranslations("audit");
  const tCommon = useTranslations("common");
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 20,
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isError } = useAuditLogs(filters);
  const { data: usersData } = useUsers({ limit: 100 });
  const { hasPermission } = usePermissions();

  const userNameMap = useMemo(() => {
    const map = new Map<string, string>();
    usersData?.data.forEach((user) => map.set(user.id, user.fullName));
    return map;
  }, [usersData]);

  const handlePageSizeChange = (size: number) => {
    setFilters((prev) => ({ ...prev, limit: size, page: 1 }));
  };

  const handleSort = (field: string, order: "asc" | "desc" | undefined) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: order ? (field as AuditLogFilters["sortBy"]) : undefined,
      sortOrder: order,
      page: 1,
    }));
  };

  const handleExportExcel = useCallback(async () => {
    setIsExporting(true);
    try {
      const exportFilters = { ...filters, page: 1, limit: 10000 };
      const allData =
        await getContainer().auditLogRepository.findAll(exportFilters);

      const ExcelJS = await import("exceljs");
      const { downloadBlob } =
        await import("@/modules/reports/presentation/utils/report-utils");

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Audit Log");

      const columns = [
        t("columns.timestamp"),
        t("columns.action"),
        t("columns.entityType"),
        t("columns.performedBy"),
        t("columns.method"),
        t("columns.status"),
        t("columns.duration"),
        "URL",
        "IP",
      ];

      worksheet.addRow(columns);

      for (const log of allData.data) {
        worksheet.addRow([
          log.createdAt.toISOString(),
          log.action,
          log.entityType,
          log.performedBy
            ? userNameMap.get(log.performedBy) || log.performedBy
            : "-",
          log.httpMethod || "-",
          log.httpStatusCode?.toString() || "-",
          log.duration !== null ? `${log.duration}ms` : "-",
          log.httpUrl || "-",
          log.ipAddress || "-",
        ]);
      }

      // Auto-size columns
      worksheet.columns.forEach((column) => {
        let maxLength = 10;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
          const cellLength = String(cell.value ?? "").length;
          if (cellLength > maxLength) maxLength = cellLength;
        });
        column.width = Math.min(maxLength + 2, 50);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const date = new Date().toISOString().split("T")[0];
      downloadBlob(blob, `audit-log-${date}.xlsx`);

      toast.success(t("export.success"));
    } catch {
      toast.error(t("export.error"));
    } finally {
      setIsExporting(false);
    }
  }, [filters, t, userNameMap]);

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
            {hasPermission(PERMISSIONS.AUDIT_EXPORT) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                disabled={isExporting || !data?.data.length}
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {t("export.excel")}
              </Button>
            )}
          </div>
          <AuditLogFiltersBar filters={filters} onFiltersChange={setFilters} />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                // eslint-disable-next-line @eslint-react/no-array-index-key
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="py-10 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t("empty.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("empty.description")}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                      <SortableHeader
                        label={t("columns.timestamp")}
                        field="createdAt"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("columns.action")}
                        field="action"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("columns.entityType")}
                        field="entityType"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label={t("columns.method")}
                        field="httpMethod"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                        className="hidden md:table-cell"
                      />
                      <SortableHeader
                        label={t("columns.status")}
                        field="httpStatusCode"
                        currentSortBy={filters.sortBy}
                        currentSortOrder={filters.sortOrder}
                        onSort={handleSort}
                        className="hidden md:table-cell"
                      />
                      <th className="hidden pb-3 pr-4 lg:table-cell">
                        {t("columns.duration")}
                      </th>
                      <th className="pb-3 pr-4 text-right">
                        {tCommon("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <td className="py-3 pr-4 text-sm whitespace-nowrap">
                          {formatDateTimeShort(log.createdAt, locale)}
                        </td>
                        <td className="py-3 pr-4">
                          <AuditActionBadge action={log.action} />
                        </td>
                        <td className="py-3 pr-4 text-sm font-medium">
                          {log.entityType}
                        </td>
                        <td className="hidden py-3 pr-4 md:table-cell">
                          <AuditMethodBadge method={log.httpMethod} />
                        </td>
                        <td className="hidden py-3 pr-4 md:table-cell">
                          <AuditStatusIndicator
                            statusCode={log.httpStatusCode}
                          />
                        </td>
                        <td className="hidden py-3 pr-4 text-sm text-muted-foreground lg:table-cell">
                          {log.duration !== null ? `${log.duration}ms` : "-"}
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

      <AuditLogDetailDialog
        auditLog={selectedLog}
        userNameMap={userNameMap}
        open={!!selectedLog}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null);
        }}
      />
    </>
  );
}
