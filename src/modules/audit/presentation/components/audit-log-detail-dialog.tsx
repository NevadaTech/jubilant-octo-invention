"use client";

import { useTranslations } from "next-intl";
import { Clock, Globe, Monitor, Link2, Hash, Timer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/dialog";
import { Badge } from "@/ui/components/badge";
import type { AuditLog } from "../../domain/entities/audit-log.entity";
import { AuditActionBadge } from "./audit-action-badge";
import { AuditMethodBadge } from "./audit-method-badge";
import { AuditStatusIndicator } from "./audit-status-indicator";

interface Props {
  auditLog: AuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditLogDetailDialog({ auditLog, open, onOpenChange }: Props) {
  const t = useTranslations("audit");

  if (!auditLog) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(date);
  };

  const metadataEntries = Object.entries(auditLog.metadata).filter(
    ([, v]) => v !== null && v !== undefined,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("detail.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("columns.action")}
              </p>
              <div className="mt-1">
                <AuditActionBadge action={auditLog.action} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("columns.entityType")}
              </p>
              <p className="mt-1 font-medium">{auditLog.entityType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("columns.entityId")}
              </p>
              <p className="mt-1 font-mono text-sm">
                {auditLog.entityId || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("columns.performedBy")}
              </p>
              <p className="mt-1 font-mono text-sm">
                {auditLog.performedBy || "-"}
              </p>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDate(auditLog.createdAt)}</span>
          </div>

          {/* HTTP Details */}
          {(auditLog.httpMethod ||
            auditLog.httpUrl ||
            auditLog.httpStatusCode !== null) && (
            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="text-sm font-semibold">
                {t("detail.httpDetails")}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {auditLog.httpMethod && (
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {t("columns.method")}:
                    </span>
                    <AuditMethodBadge method={auditLog.httpMethod} />
                  </div>
                )}
                {auditLog.httpStatusCode !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {t("columns.status")}:
                    </span>
                    <AuditStatusIndicator
                      statusCode={auditLog.httpStatusCode}
                    />
                  </div>
                )}
              </div>
              {auditLog.httpUrl && (
                <div className="flex items-start gap-2">
                  <Link2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <code className="flex-1 break-all rounded bg-muted px-2 py-1 text-xs">
                    {auditLog.httpUrl}
                  </code>
                </div>
              )}
              {auditLog.duration !== null && (
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t("detail.duration")}: {auditLog.duration}ms
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Network Info */}
          {(auditLog.ipAddress || auditLog.userAgent) && (
            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="text-sm font-semibold">
                {t("detail.networkInfo")}
              </h4>
              {auditLog.ipAddress && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{auditLog.ipAddress}</span>
                </div>
              )}
              {auditLog.userAgent && (
                <div className="flex items-start gap-2">
                  <Monitor className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span className="break-all text-xs text-muted-foreground">
                    {auditLog.userAgent}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          {metadataEntries.length > 0 && (
            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="text-sm font-semibold">{t("detail.metadata")}</h4>
              <pre className="overflow-x-auto rounded bg-muted p-3 text-xs">
                {JSON.stringify(auditLog.metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* ID */}
          <div className="border-t pt-3 text-xs text-muted-foreground">
            <span>ID: </span>
            <code>{auditLog.id}</code>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
