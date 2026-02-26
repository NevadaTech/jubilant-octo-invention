"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ClipboardList, Eye, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Skeleton } from "@/ui/components/skeleton";
import { useAuditLogs } from "../hooks/use-audit-logs";
import { usePermissions } from "@/modules/authentication/presentation/hooks/use-permissions";
import { PERMISSIONS } from "@/shared/domain/permissions";
import { auditLogApiAdapter } from "../../infrastructure/adapters/audit-log-api.adapter";
import { AuditLogFiltersBar } from "./audit-log-filters";
import { AuditLogDetailDialog } from "./audit-log-detail-dialog";
import { AuditActionBadge } from "./audit-action-badge";
import { AuditMethodBadge } from "./audit-method-badge";
import { AuditStatusIndicator } from "./audit-status-indicator";
import type { AuditLogFilters } from "../../application/dto/audit-log.dto";
import type { AuditLog } from "../../domain/entities/audit-log.entity";

export function AuditLogList() {
  const t = useTranslations("audit");
  const tCommon = useTranslations("common");
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 20,
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isError } = useAuditLogs(filters);
  const { hasPermission } = usePermissions();

  const handleExportExcel = useCallback(async () => {
    setIsExporting(true);
    try {
      // Fetch all records (up to 10000) for export
      const exportFilters = { ...filters, page: 1, limit: 10000 };
      const allData = await auditLogApiAdapter.findAll(exportFilters);

      const { utils, writeFile } = await import("xlsx");

      const rows = allData.data.map((log) => ({
        [t("columns.timestamp")]: log.createdAt.toISOString(),
        [t("columns.action")]: log.action,
        [t("columns.entityType")]: log.entityType,
        [t("columns.entityId")]: log.entityId || "-",
        [t("columns.performedBy")]: log.performedBy || "-",
        [t("columns.method")]: log.httpMethod || "-",
        [t("columns.status")]: log.httpStatusCode?.toString() || "-",
        [t("columns.duration")]:
          log.duration !== null ? `${log.duration}ms` : "-",
        URL: log.httpUrl || "-",
        IP: log.ipAddress || "-",
      }));

      const ws = utils.json_to_sheet(rows);

      // Auto-size columns
      const colWidths = Object.keys(rows[0] || {}).map((key) => ({
        wch: Math.max(
          key.length,
          ...rows.map((r) => String(r[key as keyof typeof r] ?? "").length),
          10,
        ),
      }));
      ws["!cols"] = colWidths;

      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Audit Log");

      const date = new Date().toISOString().split("T")[0];
      writeFile(wb, `audit-log-${date}.xlsx`);

      toast.success(t("export.success"));
    } catch {
      toast.error(t("export.error"));
    } finally {
      setIsExporting(false);
    }
  }, [filters, t]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(date);
  };

  const truncateId = (id: string | null) => {
    if (!id) return "-";
    return id.length > 12 ? `${id.slice(0, 12)}...` : id;
  };

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
          <div className="flex items-center justify-between">
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
                      <th className="pb-3 pr-4">{t("columns.timestamp")}</th>
                      <th className="pb-3 pr-4">{t("columns.action")}</th>
                      <th className="pb-3 pr-4">{t("columns.entityType")}</th>
                      <th className="pb-3 pr-4">{t("columns.entityId")}</th>
                      <th className="pb-3 pr-4">{t("columns.method")}</th>
                      <th className="pb-3 pr-4">{t("columns.status")}</th>
                      <th className="pb-3 pr-4">{t("columns.duration")}</th>
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
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="py-3 pr-4">
                          <AuditActionBadge action={log.action} />
                        </td>
                        <td className="py-3 pr-4 text-sm font-medium">
                          {log.entityType}
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                          {truncateId(log.entityId)}
                        </td>
                        <td className="py-3 pr-4">
                          <AuditMethodBadge method={log.httpMethod} />
                        </td>
                        <td className="py-3 pr-4">
                          <AuditStatusIndicator
                            statusCode={log.httpStatusCode}
                          />
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
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

              {data.pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t("pagination.showing", {
                      from:
                        (data.pagination.page - 1) * data.pagination.limit + 1,
                      to: Math.min(
                        data.pagination.page * data.pagination.limit,
                        data.pagination.total,
                      ),
                      total: data.pagination.total,
                    })}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!data.pagination.hasPrev}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: (prev.page || 1) - 1,
                        }))
                      }
                    >
                      {tCommon("previous")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!data.pagination.hasNext}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: (prev.page || 1) + 1,
                        }))
                      }
                    >
                      {tCommon("next")}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AuditLogDetailDialog
        auditLog={selectedLog}
        open={!!selectedLog}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null);
        }}
      />
    </>
  );
}
