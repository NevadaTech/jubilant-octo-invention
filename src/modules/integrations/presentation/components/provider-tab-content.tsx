"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Plug, Loader2 } from "lucide-react";
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
import { ConnectionCard } from "./connection-card";
import { VtexProviderHeader } from "./vtex-provider-header";
import { MeliProviderHeader } from "./meli-provider-header";
import { VtexConnectionForm } from "./vtex-connection-form";
import { MeliConnectionForm } from "./meli-connection-form";
import {
  useIntegrations,
  useDeleteIntegration,
  useTestIntegration,
  useTriggerSync,
} from "@/modules/integrations/presentation/hooks/use-integrations";
import type { IntegrationProvider } from "@/modules/integrations/domain/entities/integration-connection.entity";

interface ProviderTabContentProps {
  provider: IntegrationProvider;
}

export function ProviderTabContent({ provider }: ProviderTabContentProps) {
  const t = useTranslations("integrations");
  const tCommon = useTranslations("common");
  const {
    data: connections,
    isLoading,
    isError,
  } = useIntegrations({ provider });
  const deleteIntegration = useDeleteIntegration();
  const testIntegration = useTestIntegration();
  const triggerSync = useTriggerSync();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteIntegration.mutateAsync(deleteId);
    setDeleteId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
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

  const filteredConnections = connections ?? [];
  const providerKey = provider.toLowerCase();

  const ProviderHeader =
    provider === "MERCADOLIBRE" ? MeliProviderHeader : VtexProviderHeader;

  return (
    <div className="space-y-4">
      <ProviderHeader connections={filteredConnections} />

      {filteredConnections.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Plug className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">{t("list.empty")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("list.emptyDescription")}
            </p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t(`providers.${providerKey}.addConnection` as never)}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t(`providers.${providerKey}.addConnection` as never)}
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredConnections.map((conn) => (
              <ConnectionCard
                key={conn.id}
                connection={conn}
                onTest={(id) => testIntegration.mutate(id)}
                onSync={(id) => triggerSync.mutate({ id })}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        </>
      )}

      {showForm &&
        (provider === "MERCADOLIBRE" ? (
          <MeliConnectionForm open={showForm} onOpenChange={setShowForm} />
        ) : (
          <VtexConnectionForm
            open={showForm}
            onOpenChange={setShowForm}
            mode="create"
          />
        ))}

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
    </div>
  );
}
