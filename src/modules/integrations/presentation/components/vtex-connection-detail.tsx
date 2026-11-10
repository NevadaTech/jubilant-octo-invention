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
  MoreVertical,
} from "lucide-react";
import { Button } from "@/ui/components/button";
import { PageHeader } from "@/ui/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/components/dropdown-menu";
import { Skeleton } from "@/ui/components/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/components/tabs";
import { ActionDialog } from "./action-dialog";
import { ConnectionStatusBadge } from "./connection-status-badge";
import { SyncLogTable } from "./sync-log-table";
import { SkuMappingTable } from "./sku-mapping-table";
import { SkuMappingForm } from "./sku-mapping-form";
import { UnmatchedSkusAlert } from "./unmatched-skus-alert";
import { VtexConnectionForm } from "./vtex-connection-form";
import { SyncConfigurationDialog } from "./sync-configuration-dialog";
import { WebhookCredentialsDisplay } from "./webhook-credentials-display";
import {
  useIntegration,
  useDeleteIntegration,
  useTestIntegration,
  useTriggerSync,
} from "@/modules/integrations/presentation/hooks/use-integrations";
import { useWarehouses } from "@/modules/inventory/presentation/hooks/use-warehouses";

interface VtexConnectionDetailProps {
  connectionId: string;
}

export function VtexConnectionDetail({
  connectionId,
}: VtexConnectionDetailProps) {
  const locale = useLocale();
  const t = useTranslations("integrations");
  const tCommon = useTranslations("common");
  const vtexProvider = t("providers.vtex.name");
  const router = useRouter();
  const { data: connection, isLoading, isError } = useIntegration(connectionId);
  const deleteIntegration = useDeleteIntegration();
  const testIntegration = useTestIntegration();
  const triggerSync = useTriggerSync();
  const { data: warehousesResult } = useWarehouses();
  const warehouses = warehousesResult?.data ?? [];
  const [activeTab, setActiveTab] = useState("logs");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
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

  const syncStrategyLabels: Record<string, string> = {
    WEBHOOK: t("syncStrategy.WEBHOOK"),
    POLLING: t("syncStrategy.POLLING"),
    BOTH: t("syncStrategy.BOTH"),
  };

  const syncDirectionLabels: Record<string, string> = {
    INBOUND: t("syncDirection.inbound", { provider: vtexProvider }),
    OUTBOUND: t("syncDirection.outbound", { provider: vtexProvider }),
    BIDIRECTIONAL: t("syncDirection.bidirectional"),
  };

  const warehouseName =
    warehouses.find((w) => w.id === connection.defaultWarehouseId)?.name ??
    connection.warehouseName ??
    connection.defaultWarehouseId;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/integrations"
        className="text-sm font-semibold text-primary"
      >
        {t("back")}
      </Link>
      <PageHeader
        title={connection.storeName}
        description={`${connection.provider} · ${connection.accountName}`}
        action={
          connection.isConnected ? (
            <Button
              onClick={() => setSyncDialogOpen(true)}
              disabled={triggerSync.isPending}
            >
              {triggerSync.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {t("actions.sync")}
            </Button>
          ) : (
            <Button onClick={() => setEditFormOpen(true)}>
              {t("actions.connect")}
            </Button>
          )
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ConnectionStatusBadge status={connection.status} />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => testIntegration.mutate(connectionId)}
            disabled={testIntegration.isPending}
          >
            {t("actions.test")}
          </Button>
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="mr-2 h-4 w-4" />
              {tCommon("actions")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="lg:hidden"
              onClick={() => testIntegration.mutate(connectionId)}
              disabled={testIntegration.isPending}
            >
              <TestTube className="mr-2 h-4 w-4" />
              {t("actions.test")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditFormOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("actions.edit")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {tCommon("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
      {connection.status === "ERROR" || connection.lastSyncError ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-3 text-sm text-destructive">
          {connection.lastSyncError || t("connectError")}
        </p>
      ) : null}

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
                <Badge variant="secondary">
                  {syncStrategyLabels[connection.syncStrategy] ??
                    connection.syncStrategy}
                </Badge>
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
              <dd className="mt-1 text-sm">{warehouseName}</dd>
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
            {connection.lastSyncError && (
              <div className="sm:col-span-2 lg:col-span-3 lg:hidden">
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("fields.lastError")}
                </dt>
                <dd className="mt-1 text-sm text-destructive">
                  {connection.lastSyncError}
                </dd>
              </div>
            )}
            <WebhookCredentialsDisplay
              webhookUrl={connection.webhookUrl}
              webhookSecret={connection.webhookSecret}
            />
          </dl>
        </CardContent>
      </Card>

      {/* Tabs: Sync Logs, SKU Mappings */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="logs">{t("syncLogs.title")}</TabsTrigger>
          <TabsTrigger value="sku-mappings">
            {t("skuMapping.title")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="mt-4">
          <SyncLogTable connectionId={connectionId} />
        </TabsContent>

        {activeTab === "sku-mappings" && (
          <TabsContent value="sku-mappings" className="mt-4 space-y-4">
            <SkuMappingForm connectionId={connectionId} />
            <UnmatchedSkusAlert connectionId={connectionId} />
            <SkuMappingTable connectionId={connectionId} />
          </TabsContent>
        )}
      </Tabs>

      {/* Edit Form Dialog - only mount when open to avoid unnecessary API calls */}
      {editFormOpen && (
        <VtexConnectionForm
          open={editFormOpen}
          onOpenChange={setEditFormOpen}
          mode="edit"
          connection={connection}
        />
      )}

      {/* Sync Configuration Dialog */}
      <SyncConfigurationDialog
        open={syncDialogOpen}
        onOpenChange={setSyncDialogOpen}
        provider="VTEX"
        lastSyncAt={connection.lastSyncAt}
        onConfirm={({ fromDate, statuses }) => {
          setSyncDialogOpen(false);
          triggerSync.mutate({ id: connectionId, fromDate, statuses });
        }}
        isPending={triggerSync.isPending}
      />

      {/* Delete Dialog */}
      <ActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("messages.confirmDelete")}
        consequence={t("messages.confirmDeleteDescription")}
        confirmLabel={tCommon("delete")}
        onConfirm={handleDelete}
        pending={deleteIntegration.isPending}
        destructive
      />
    </div>
  );
}
