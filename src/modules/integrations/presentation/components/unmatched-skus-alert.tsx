"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/ui/components/badge";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/dialog";
import { useUnmatchedSkus } from "@/modules/integrations/presentation/hooks/use-integrations";
import { SkuMappingForm } from "./sku-mapping-form";

interface UnmatchedSkusAlertProps {
  connectionId: string;
}

export function UnmatchedSkusAlert({ connectionId }: UnmatchedSkusAlertProps) {
  const t = useTranslations("integrations.skuMapping");
  const tModule = useTranslations("integrations");
  const { data: unmatchedSkus } = useUnmatchedSkus(connectionId);
  const [mappingKey, setMappingKey] = useState<string | null>(null);

  if (!unmatchedSkus || unmatchedSkus.length === 0) return null;

  const mappingSku = unmatchedSkus.find((sku) => sku.id === mappingKey) ?? null;

  return (
    <Card className="border-warning/50 bg-warning/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-warning" />
          {t("unmatchedAlert")}
          <Badge variant="warning">{unmatchedSkus.length}</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("unmatchedDescription")}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {unmatchedSkus.map((sku) => {
          const itemKey = sku.id;
          return (
            <div
              key={itemKey}
              className="flex items-center justify-between rounded-md border p-2"
            >
              <div>
                <span className="font-mono text-sm">{sku.externalSku}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({sku.externalOrderId})
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMappingKey(itemKey)}
              >
                {t("mapThis")}
              </Button>
            </div>
          );
        })}
      </CardContent>

      <Dialog
        open={mappingSku !== null}
        onOpenChange={(open) => {
          if (!open) setMappingKey(null);
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader className="space-y-2 text-left">
            <p className="text-xs font-semibold text-muted-foreground">
              {tModule("module")}
            </p>
            <DialogTitle className="text-lg font-semibold">
              {t("title")}
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground">
              {mappingSku
                ? t("mismatch", { sku: mappingSku.externalSku })
                : t("unmatchedDescription")}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("comboHint")}</p>
          {mappingSku ? (
            <SkuMappingForm
              connectionId={connectionId}
              defaultExternalSku={mappingSku.externalSku}
              framed={false}
              onCancel={() => setMappingKey(null)}
              onSuccess={() => setMappingKey(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
