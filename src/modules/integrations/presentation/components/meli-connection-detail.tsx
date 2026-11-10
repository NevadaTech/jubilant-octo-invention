"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  Trash2,
  TestTube,
  RefreshCw,
  Loader2,
  AlertTriangle,
  ExternalLink,
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
import { InitialSyncStatePicker } from "./initial-sync-state-picker";
import { WebhookCredentialsDisplay } from "./webhook-credentials-display";
import {
  useIntegration,
  useDeleteIntegration,
  useTestIntegration,
  useTriggerSync,
  useGetMeliAuthUrl,
} from "@/modules/integrations/presentation/hooks/use-integrations";
import { useWarehouses } from "@/modules/inventory/presentation/hooks/use-warehouses";
import type { TokenStatus } from "@/modules/integrations/domain/entities/integration-connection.entity";

interface MeliConnectionDetailProps {
  connectionId: string;
}

const TOKEN_STATUS_VARIANTS: Record<
  TokenStatus,
  "success" | "warning" | "destructive" | "secondary"
> = {
  VALID: "success",
  REFRESHING: "secondary",
  PENDING_AUTH: "warning",
  REAUTH_REQUIRED: "destructive",
};

function TokenStatusBadge({ status }: { status: TokenStatus | null }) {
  const t = useTranslations("integrations");

  if (!status) return null;

  return (
    <Badge variant={TOKEN_STATUS_VARIANTS[status] ?? "secondary"}>
      {t(`providers.mercadolibre.tokenStatus.${status}` as never)}
    </Badge>
  );
}

export function MeliConnectionDetail({
  connectionId,
}: MeliConnectionDetailProps) {
  const locale = useLocale();
  const t = useTranslations("integrations");
  const tCommon = useTranslations("common");
  const meliProvider = t("providers.mercadolibre.name");
  const router = useRouter();
  const { data: connection, isLoading, isError } = useIntegration(connectionId);
  const deleteIntegration = useDeleteIntegration();
  const testIntegration = useTestIntegration();
  const triggerSync = useTriggerSync();
  const getMeliAuthUrl = useGetMeliAuthUrl();
  const { data: warehousesResult } = useWarehouses();
  const warehouses = warehousesResult?.data ?? [];
  const [activeTab, setActiveTab] = useState("logs");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [initialSyncOpen, setInitialSyncOpen] = useState(false);

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

  const handleReauth = async () => {
    const currentUrl = window.location.href;
    const result = await getMeliAuthUrl.mutateAsync({
      connectionId,
      redirectUri: currentUrl,
    });
    if (result.data?.authUrl) {
      window.location.href = result.data.authUrl;
    }
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

  const warehouseName =
    warehouses.find((w) => w.id === connection.defaultWarehouseId)?.name ??
    connection.warehouseName ??
    connection.defaultWarehouseId;

  const fullWarehouseDisplayName = connection.fullWarehouseId
    ? (warehouses.find((w) => w.id === connection.fullWarehouseId)?.name ??
      connection.fullWarehouseName ??
      connection.fullWarehouseId)
    : null;

  return (
    <div className="space-y-6">
      {/* Re-auth Banner */}
      {connection.needsReauth && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div className="flex-1">
              <p className="font-medium text-warning">
                {t("providers.mercadolibre.reauthRequired")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("providers.mercadolibre.reauthDescription")}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleReauth}
              disabled={getMeliAuthUrl.isPending}
            >
              {getMeliAuthUrl.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              {t("providers.mercadolibre.reauthAction")}
            </Button>
          </CardContent>
        </Card>
      )}

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
              onClick={() => {
                if (!connection.lastSyncAt) {
                  setInitialSyncOpen(true);
                } else {
                  triggerSync.mutate({ id: connectionId });
                }
              }}
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
            <Button onClick={handleReauth} disabled={getMeliAuthUrl.isPending}>
              {getMeliAuthUrl.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              {t("providers.mercadolibre.connectButton")}
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
                {t("providers.mercadolibre.tokenStatusLabel")}
              </dt>
              <dd className="mt-1">
                <TokenStatusBadge status={connection.tokenStatus} />
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
                  {t("syncDirection.inbound", { provider: meliProvider })}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("form.warehouse")}
              </dt>
              <dd className="mt-1 text-sm">{warehouseName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("detail.fulfillmentWarehouse")}
              </dt>
              <dd className="mt-1 text-sm">
                {fullWarehouseDisplayName ?? t("detail.notConfigured")}
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

      {/* Initial Sync State Picker */}
      <InitialSyncStatePicker
        open={initialSyncOpen}
        onOpenChange={setInitialSyncOpen}
        provider="MERCADOLIBRE"
        isPending={triggerSync.isPending}
        onConfirm={(statuses) => {
          setInitialSyncOpen(false);
          triggerSync.mutate({ id: connectionId, statuses });
        }}
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
