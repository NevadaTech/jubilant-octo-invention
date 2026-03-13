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
  Eye,
  EyeOff,
  Copy,
  Check,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/ui/components/button";
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
import { VtexConnectionForm } from "./vtex-connection-form";
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
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

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
    INBOUND: t("syncDirection.inbound"),
    OUTBOUND: t("syncDirection.outbound"),
    BIDIRECTIONAL: t("syncDirection.bidirectional"),
  };

  const warehouseName =
    warehouses.find((w) => w.id === connection.defaultWarehouseId)?.name ??
    connection.warehouseName ??
    connection.defaultWarehouseId;

  const handleCopySecret = async () => {
    if (connection.webhookSecret) {
      await navigator.clipboard.writeText(connection.webhookSecret);
      setCopied(true);
      toast.success(t("detail.webhookSecretCopied"));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full"
          >
            <Link href="/dashboard/integrations">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="truncate text-2xl font-bold text-foreground">
                {connection.storeName}
              </h1>
              <ConnectionStatusBadge status={connection.status} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {connection.provider} &middot; {connection.accountName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => testIntegration.mutate(connectionId)}
            disabled={testIntegration.isPending}
          >
            {testIntegration.isPending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <TestTube className="mr-1.5 h-3.5 w-3.5" />
            )}
            {t("actions.test")}
          </Button>
          <Button
            size="sm"
            onClick={() => triggerSync.mutate({ id: connectionId })}
            disabled={!connection.isConnected || triggerSync.isPending}
          >
            {triggerSync.isPending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            )}
            {t("actions.sync")}
          </Button>
          <div className="mx-0.5 h-6 w-px bg-border" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setEditFormOpen(true)}
                className="cursor-pointer gap-2"
              >
                <Pencil className="h-4 w-4" />
                {t("actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                {tCommon("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("fields.lastError")}
                </dt>
                <dd className="mt-1 text-sm text-destructive">
                  {connection.lastSyncError}
                </dd>
              </div>
            )}
            {connection.webhookSecret && (
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("fields.webhookSecret")}
                </dt>
                <dd className="mt-1 flex items-center gap-2">
                  <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                    {showSecret
                      ? connection.webhookSecret
                      : "\u2022".repeat(32)}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCopySecret}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </dd>
              </div>
            )}
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
