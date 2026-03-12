"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, X } from "lucide-react";
import { Badge } from "@/ui/components/badge";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { useUnmatchedSkus } from "@/modules/integrations/presentation/hooks/use-integrations";
import { SkuMappingForm } from "./sku-mapping-form";

interface UnmatchedSkusAlertProps {
  connectionId: string;
}

export function UnmatchedSkusAlert({ connectionId }: UnmatchedSkusAlertProps) {
  const t = useTranslations("integrations.skuMapping");
  const { data: unmatchedSkus } = useUnmatchedSkus(connectionId);
  const [mappingKey, setMappingKey] = useState<string | null>(null);

  if (!unmatchedSkus || unmatchedSkus.length === 0) return null;

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
              {mappingKey === itemKey ? (
                <div className="flex-1 ml-4 flex items-end gap-2">
                  <div className="flex-1">
                    <SkuMappingForm
                      connectionId={connectionId}
                      defaultExternalSku={sku.externalSku}
                      onSuccess={() => setMappingKey(null)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setMappingKey(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMappingKey(itemKey)}
                >
                  {t("mapThis")}
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
