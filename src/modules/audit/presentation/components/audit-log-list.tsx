"use client";

import { useState, useCallback, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDateTimeShort } from "@/lib/date";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/ui/components/button";
import { Skeleton } from "@/ui/components/skeleton";
import { TablePagination } from "@/ui/components/table-pagination";
import { PageHeader } from "@/ui/layout/page-header";
import { cn } from "@/ui/lib/utils";
import { useAuditLogs } from "@/modules/audit/presentation/hooks/use-audit-logs";
import { useUsers } from "@/modules/users/presentation/hooks/use-users";
import { usePermissions } from "@/modules/authentication/presentation/hooks/use-permissions";
import { PERMISSIONS } from "@/shared/domain/permissions";
import { getContainer } from "@/config/di/container";
import { AuditLogFiltersBar } from "./audit-log-filters";
import { AuditLogDetailDialog } from "./audit-log-detail-dialog";
import type { AuditLogFilters } from "@/modules/audit/application/dto/audit-log.dto";
import type { AuditLog } from "@/modules/audit/domain/entities/audit-log.entity";

function StatusChip({ code }: { code: number | null }) {
  if (code === null) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  const ok = code >= 200 && code < 400;
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
        ok
          ? "bg-success-100 text-success-600"
          : "bg-error-100 text-destructive",
      )}
    >
      {code}
    </span>
  );
}

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

  const actorName = (log: AuditLog) => {
    if (!log.performedBy) return "—";
    return userNameMap.get(log.performedBy) || log.performedBy;
  };

  const entityLabel = (log: AuditLog) =>
    log.entityId ? `${log.entityType} · ${log.entityId}` : log.entityType;

  const actionLabel = (action: string) => action.replace(/_/g, " ");

  const handlePageSizeChange = (size: number) => {
    setFilters((prev) => ({ ...prev, limit: size, page: 1 }));
  };

  const handleSort = (field: NonNullable<AuditLogFilters["sortBy"]>) => {
    setFilters((prev) => {
      const nextOrder =
        prev.sortBy !== field
          ? "asc"
          : prev.sortOrder === "asc"
            ? "desc"
            : undefined;
      return {
        ...prev,
        sortBy: nextOrder ? field : undefined,
        sortOrder: nextOrder,
        page: 1,
      };
    });
  };

  const sortMark = (field: string) => {
    if (filters.sortBy !== field) return "";
    return filters.sortOrder === "asc" ? " ↑" : " ↓";
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

      worksheet.addRow([
        t("columns.timestamp"),
        t("columns.action"),
        t("columns.entityType"),
        t("columns.performedBy"),
        t("columns.method"),
        t("columns.status"),
        t("columns.duration"),
        "URL",
        "IP",
      ]);

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

  return (
    <>
      <div className="space-y-4">
        <PageHeader
          title={t("list.title")}
          action={
            hasPermission(PERMISSIONS.AUDIT_EXPORT) ? (
              <Button
                type="button"
                onClick={handleExportExcel}
                disabled={isExporting || !data?.data.length}
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {tCommon("export")}
              </Button>
            ) : null
          }
        />

        <AuditLogFiltersBar filters={filters} onFiltersChange={setFilters} />

        {isError ? (
          <p className="rounded-xl border border-border bg-card px-4 py-8 text-center text-sm text-destructive">
            {t("error.loading")}
          </p>
        ) : isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
              <Skeleton key={item} className="h-12 w-full" />
            ))}
          </div>
        ) : !data?.data.length ? (
          <div className="rounded-xl border border-border bg-card px-4 py-10 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              {t("empty.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("empty.description")}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-xl border border-border bg-card lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="h-[42px] bg-background text-left text-[13px] font-semibold text-muted-foreground">
                    <th className="px-3 font-semibold" scope="col">
                      <button type="button" onClick={() => handleSort("createdAt")}>
                        {t("columns.timestamp")}
                        {sortMark("createdAt")}
                      </button>
                    </th>
                    <th className="px-3 font-semibold" scope="col">
                      <button type="button" onClick={() => handleSort("action")}>
                        {t("columns.action")}
                        {sortMark("action")}
                      </button>
                    </th>
                    <th className="px-3 font-semibold" scope="col">
                      <button
                        type="button"
                        onClick={() => handleSort("entityType")}
                      >
                        {t("columns.entityType")}
                        {sortMark("entityType")}
                      </button>
                    </th>
                    <th className="px-3 font-semibold" scope="col">
                      {t("columns.performedBy")}
                    </th>
                    <th className="px-3 font-semibold" scope="col">
                      <button
                        type="button"
                        onClick={() => handleSort("httpStatusCode")}
                      >
                        {t("columns.status")}
                        {sortMark("httpStatusCode")}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((log) => (
                    <tr
                      key={log.id}
                      className="h-[52px] cursor-pointer border-t border-border hover:bg-background"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="whitespace-nowrap px-3 text-foreground">
                        {formatDateTimeShort(log.createdAt, locale)}
                      </td>
                      <td className="px-3 text-foreground">
                        <div>{actionLabel(log.action)}</div>
                        {log.httpMethod ? <div>{log.httpMethod}</div> : null}
                        {log.duration != null ? <div>{log.duration}ms</div> : null}
                      </td>
                      <td className="px-3 font-semibold text-foreground">
                        <span>{log.entityType}</span>
                        {log.entityId ? (
                          <span className="font-normal text-muted-foreground">
                            {" "}
                            · {log.entityId}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 text-foreground">{actorName(log)}</td>
                      <td className="px-3">
                        <StatusChip code={log.httpStatusCode} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card lg:hidden">
              {data.data.map((log) => (
                <button
                  key={log.id}
                  type="button"
                  className="block w-full border-b border-border px-3 py-2.5 text-left last:border-b-0"
                  onClick={() => setSelectedLog(log)}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm text-foreground">
                      {formatDateTimeShort(log.createdAt, locale)}
                    </span>
                    <StatusChip code={log.httpStatusCode} />
                  </span>
                  <span className="mt-0.5 block text-sm font-semibold text-foreground">
                    {actionLabel(log.action)}
                  </span>
                  <span className="block text-[13px] text-muted-foreground">
                    {entityLabel(log)}
                    {" · "}
                    {actorName(log)}
                  </span>
                </button>
              ))}
            </div>

            <TablePagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              limit={data.pagination.limit}
              onPageChange={(page) =>
                setFilters((prev) => ({ ...prev, page }))
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
              allLabel={tCommon("pagination.all")}
            />
          </>
        )}
      </div>

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
