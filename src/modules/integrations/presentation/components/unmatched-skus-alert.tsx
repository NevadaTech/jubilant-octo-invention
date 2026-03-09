"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
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
  const [mappingSku, setMappingSku] = useState<string | null>(null);

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
        {unmatchedSkus.map((sku) => (
          <div
            key={`${sku.externalSku}-${sku.externalOrderId}`}
            className="flex items-center justify-between rounded-md border p-2"
          >
            <div>
              <span className="font-mono text-sm">{sku.externalSku}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                ({sku.externalOrderId})
              </span>
            </div>
            {mappingSku === sku.externalSku ? (
              <div className="flex-1 ml-4">
                <SkuMappingForm
                  connectionId={connectionId}
                  defaultExternalSku={sku.externalSku}
                />
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMappingSku(sku.externalSku)}
              >
                {t("mapThis")}
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
