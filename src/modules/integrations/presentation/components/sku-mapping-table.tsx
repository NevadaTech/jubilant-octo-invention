"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Skeleton } from "@/ui/components/skeleton";
import {
  useSkuMappings,
  useDeleteSkuMapping,
} from "@/modules/integrations/presentation/hooks/use-integrations";

interface SkuMappingTableProps {
  connectionId: string;
}

export function SkuMappingTable({ connectionId }: SkuMappingTableProps) {
  const t = useTranslations("integrations.skuMapping");
  const { data: mappings, isLoading } = useSkuMappings(connectionId);
  const deleteMapping = useDeleteSkuMapping(connectionId);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isLoading) {
    return <Skeleton className="h-32" />;
  }

  if (!mappings || mappings.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        {t("empty")}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium text-muted-foreground">
              {t("externalSku")}
            </th>
            <th className="pb-2 font-medium text-muted-foreground">
              {t("product")}
            </th>
            <th className="pb-2 font-medium text-muted-foreground">
              {t("productSku")}
            </th>
            <th className="pb-2 w-16" />
          </tr>
        </thead>
        <tbody>
          {mappings.map((mapping) => (
            <tr key={mapping.id} className="border-b">
              <td className="py-2 font-mono text-xs">{mapping.externalSku}</td>
              <td className="py-2">
                {mapping.productName || mapping.productId}
              </td>
              <td className="py-2 text-xs text-muted-foreground">
                {mapping.productSku || "-"}
              </td>
              <td className="py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDeletingId(mapping.id);
                    deleteMapping.mutate(mapping.id, {
                      onSettled: () => setDeletingId(null),
                    });
                  }}
                  disabled={deletingId !== null}
                >
                  {deletingId === mapping.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3 text-destructive" />
                  )}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
