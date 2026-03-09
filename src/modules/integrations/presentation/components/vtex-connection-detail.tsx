"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  TestTube,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";
import { Skeleton } from "@/ui/components/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/components/tabs";
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
import { ConnectionStatusBadge } from "./connection-status-badge";
import { SyncLogTable } from "./sync-log-table";
import { SkuMappingTable } from "./sku-mapping-table";
import { SkuMappingForm } from "./sku-mapping-form";
import { UnmatchedSkusAlert } from "./unmatched-skus-alert";
import { FailedSyncsTab } from "./failed-syncs-tab";
import { VtexConnectionForm } from "./vtex-connection-form";
import {
  useIntegration,
  useDeleteIntegration,
  useTestIntegration,
  useTriggerSync,
} from "@/modules/integrations/presentation/hooks/use-integrations";

interface VtexConnectionDetailProps {
  connectionId: string;
}

export function VtexConnectionDetail({
  connectionId,
}: VtexConnectionDetailProps) {
  const locale = useLocale();
  const t = useTranslations("integrations");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const {
    data: connection,
    isLoading,
    isError,
  } = useIntegration(connectionId);
  const deleteIntegration = useDeleteIntegration();
  const testIntegration = useTestIntegration();
  const triggerSync = useTriggerSync();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const handleDelete = async () => {
    await deleteIntegration.mutateAsync(connectionId);
    setDeleteDialogOpen(false);
    router.push("/dashboard/integrations");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (isError || !connection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/integrations">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{t("detail.notFound")}</h1>
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">
              {t("detail.notFoundDescription")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const syncDirectionLabels: Record<string, string> = {
    INBOUND: t("syncDirection.inbound"),
    OUTBOUND: t("syncDirection.outbound"),
    BIDIRECTIONAL: t("syncDirection.bidirectional"),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/integrations">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {connection.storeName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {connection.provider} &middot; {connection.accountName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => testIntegration.mutate(connectionId)}
            disabled={testIntegration.isPending}
          >
            {testIntegration.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <TestTube className="mr-2 h-4 w-4" />
            )}
            {t("actions.test")}
          </Button>
          <Button
            variant="outline"
            onClick={() => triggerSync.mutate(connectionId)}
            disabled={!connection.isConnected || triggerSync.isPending}
          >
            {triggerSync.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {t("actions.sync")}
          </Button>
          <Button variant="outline" onClick={() => setEditFormOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            {t("actions.edit")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {tCommon("delete")}
          </Button>
        </div>
      </div>

      {/* Connection Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t("detail.info")}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("fields.status")}
              </dt>
              <dd className="mt-1">
                <ConnectionStatusBadge status={connection.status} />
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("form.syncStrategy")}
              </dt>
              <dd className="mt-1 text-sm">
                <Badge variant="secondary">{connection.syncStrategy}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("form.syncDirection")}
              </dt>
              <dd className="mt-1 text-sm">
                <Badge variant="info">
                  {syncDirectionLabels[connection.syncDirection] ??
                    connection.syncDirection}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("form.warehouse")}
              </dt>
              <dd className="mt-1 text-sm">
                {connection.warehouseName || connection.defaultWarehouseId}
              </dd>
            </div>
            {connection.defaultContactName && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("form.defaultContact")}
                </dt>
                <dd className="mt-1 text-sm">
                  {connection.defaultContactName}
                </dd>
              </div>
            )}
            {connection.companyName && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("form.company")}
                </dt>
                <dd className="mt-1 text-sm">{connection.companyName}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("fields.connectedAt")}
              </dt>
              <dd className="mt-1 text-sm">
                {formatDate(connection.connectedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("fields.lastSync")}
              </dt>
              <dd className="mt-1 text-sm">
                {formatDate(connection.lastSyncAt)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("fields.syncedOrders")}
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {connection.syncedOrdersCount}
              </dd>
            </div>
            {connection.lastSyncError && (
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("fields.lastError")}
                </dt>
                <dd className="mt-1 text-sm text-destructive">
                  {connection.lastSyncError}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Unmatched SKUs Alert */}
      <UnmatchedSkusAlert connectionId={connectionId} />

      {/* Tabs: Sync Logs, SKU Mappings, Failed */}
      <Tabs defaultValue="logs">
        <TabsList>
          <TabsTrigger value="logs">{t("syncLogs.title")}</TabsTrigger>
          <TabsTrigger value="sku-mappings">
            {t("skuMapping.title")}
          </TabsTrigger>
          <TabsTrigger value="failed">{t("failedSyncs.title")}</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="mt-4">
          <SyncLogTable connectionId={connectionId} />
        </TabsContent>

        <TabsContent value="sku-mappings" className="mt-4 space-y-4">
          <SkuMappingForm connectionId={connectionId} />
          <SkuMappingTable connectionId={connectionId} />
        </TabsContent>

        <TabsContent value="failed" className="mt-4">
          <FailedSyncsTab connectionId={connectionId} />
        </TabsContent>
      </Tabs>

      {/* Edit Form Dialog */}
      <VtexConnectionForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        mode="edit"
        connection={connection}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
    </div>
  );
}
