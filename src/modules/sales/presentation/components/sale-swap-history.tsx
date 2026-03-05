"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Skeleton } from "@/ui/components/skeleton";
import { Badge } from "@/ui/components/badge";
import { useSaleSwapHistory } from "../hooks/use-sales";

interface SaleSwapHistoryProps {
  saleId: string;
}

export function SaleSwapHistory({ saleId }: SaleSwapHistoryProps) {
  const locale = useLocale();
  const t = useTranslations("sales.swapHistory");
  const { data: swaps, isLoading } = useSaleSwapHistory(saleId);

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateStr));
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatStrategy = (strategy: string) => {
    if (strategy === "KEEP_ORIGINAL") return t("keepOriginal");
    if (strategy === "NEW_PRICE") return t("newPrice");
    return strategy;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!swaps || swaps.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {swaps.map((swap) => (
            <div key={swap.id} className="rounded-lg border p-4 space-y-2">
              {/* Row 1: Product swap */}
              <div className="flex items-center gap-2 flex-wrap">
                <ArrowLeftRight className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium">{swap.originalProductName}</span>
                <span className="text-sm text-muted-foreground">
                  ({swap.originalProductSku})
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium">
                  {swap.replacementProductName}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({swap.replacementProductSku})
                </span>
                {swap.isCrossWarehouse && (
                  <Badge variant="info">{t("crossWarehouse")}</Badge>
                )}
                {swap.originalQuantity !== swap.replacementQuantity && (
                  <Badge variant="warning">{t("partial")}</Badge>
                )}
              </div>

              {/* Row 2: Qty, price, strategy */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap pl-6">
                <span>
                  {t("quantity")}: {swap.originalQuantity}
                </span>
                <span className="mx-1">&middot;</span>
                <span>
                  {t("price")}:{" "}
                  {formatCurrency(
                    swap.originalSalePrice,
                    swap.originalCurrency,
                  )}
                </span>
                <ArrowRight className="h-3 w-3 shrink-0" />
                <span>
                  {formatCurrency(
                    swap.replacementSalePrice,
                    swap.replacementCurrency,
                  )}
                </span>
                <span className="mx-1">&middot;</span>
                <span>
                  {t("strategy")}: {formatStrategy(swap.pricingStrategy)}
                </span>
              </div>

              {/* Row 3: Reason (if present) */}
              {swap.reason && (
                <div className="text-sm text-muted-foreground pl-6">
                  {t("reason")}: {swap.reason}
                </div>
              )}

              {/* Row 4: Performed by + date */}
              <div className="text-sm text-muted-foreground pl-6">
                {t("by")}: {swap.performedByName} &middot;{" "}
                {formatDate(swap.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
