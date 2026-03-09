"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  MoreHorizontal,
  Plug,
  RefreshCw,
  TestTube,
  Trash2,
  Pencil,
  Loader2,
} from "lucide-react";
import { Button } from "@/ui/components/button";
import { Card, CardContent } from "@/ui/components/card";
import { Skeleton } from "@/ui/components/skeleton";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
import { ConnectionStatusBadge } from "./connection-status-badge";
import {
  useIntegrations,
  useDeleteIntegration,
  useTestIntegration,
  useTriggerSync,
} from "@/modules/integrations/presentation/hooks/use-integrations";

export function IntegrationList() {
  const locale = useLocale();
  const t = useTranslations("integrations");
  const tCommon = useTranslations("common");
  const { data: connections, isLoading, isError } = useIntegrations();
  const deleteIntegration = useDeleteIntegration();
  const testIntegration = useTestIntegration();
  const triggerSync = useTriggerSync();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteIntegration.mutateAsync(deleteId);
    setDeleteId(null);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-destructive">{t("error.loading")}</p>
        </CardContent>
      </Card>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Plug className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">{t("list.empty")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("list.emptyDescription")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {connections.map((conn) => (
          <Card key={conn.id} className="relative">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <Plug className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <Link
                      href={`/dashboard/integrations/${conn.id}`}
                      className="font-semibold hover:underline"
                    >
                      {conn.storeName}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {conn.provider} &middot; {conn.accountName}
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
                    <DropdownMenuItem
                      onClick={() => testIntegration.mutate(conn.id)}
                    >
                      <TestTube className="mr-2 h-4 w-4" />
                      {t("actions.test")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => triggerSync.mutate(conn.id)}
                      disabled={!conn.isConnected}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {t("actions.sync")}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/integrations/${conn.id}`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {t("actions.edit")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteId(conn.id)}
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
                  <ConnectionStatusBadge status={conn.status} />
                </div>
                {conn.companyName && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("form.company")}
                    </span>
                    <span className="text-sm">{conn.companyName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("fields.lastSync")}
                  </span>
                  <span className="text-sm">
                    {formatDate(conn.lastSyncAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("fields.syncedOrders")}
                  </span>
                  <span className="text-sm font-medium">
                    {conn.syncedOrdersCount}
                  </span>
                </div>
                {conn.lastSyncError && (
                  <p className="text-xs text-destructive truncate">
                    {conn.lastSyncError}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("messages.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("messages.confirmDeleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteIntegration.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
