"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MoreHorizontal, Plug, TestTube, Trash2, Pencil } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Card, CardContent } from "@/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
import { ConnectionStatusBadge } from "./connection-status-badge";
import type { IntegrationConnection } from "@/modules/integrations/domain/entities/integration-connection.entity";

interface ConnectionCardProps {
  connection: IntegrationConnection;
  onTest: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConnectionCard({
  connection,
  onTest,
  onDelete,
}: ConnectionCardProps) {
  const locale = useLocale();
  const t = useTranslations("integrations");

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  };

  return (
    <Card className="relative">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <Plug className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <Link
                href={`/dashboard/integrations/${connection.id}`}
                className="font-semibold hover:underline"
              >
                {connection.storeName}
              </Link>
              <p className="text-xs text-muted-foreground">
                {connection.accountName}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onTest(connection.id)}>
                <TestTube className="mr-2 h-4 w-4" />
                {t("actions.test")}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/integrations/${connection.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t("actions.edit")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(connection.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("actions.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("fields.status")}
            </span>
            <ConnectionStatusBadge status={connection.status} />
          </div>
          {connection.companyName && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("form.company")}
              </span>
              <span className="text-sm">{connection.companyName}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("fields.lastSync")}
            </span>
            <span className="text-sm">{formatDate(connection.lastSyncAt)}</span>
          </div>
          {connection.lastSyncError && (
            <p className="text-xs text-destructive truncate">
              {connection.lastSyncError}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
