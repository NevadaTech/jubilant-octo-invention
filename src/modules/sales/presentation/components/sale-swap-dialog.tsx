"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/dialog";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { SearchableSelect } from "@/ui/components/searchable-select";
import { CurrencyInput } from "@/ui/components/currency-input";
import { useProducts } from "@/modules/inventory/presentation/hooks/use-products";
import { useWarehouses } from "@/modules/inventory/presentation/hooks/use-warehouses";
import { useSwapSaleLine } from "@/modules/sales/presentation/hooks/use-sales";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";
import type { SaleLine } from "@/modules/sales/domain/entities/sale.entity";

interface SaleSwapDialogProps {
  saleId: string;
  line: SaleLine;
  saleCurrency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaleSwapDialog({
  saleId,
  line,
  saleCurrency,
  open,
  onOpenChange,
}: SaleSwapDialogProps) {
  const t = useTranslations("sales");
  const tCommon = useTranslations("common");

  const [replacementProductId, setReplacementProductId] = useState("");
  const [swapQuantity, setSwapQuantity] = useState(line.quantity);
  const [sourceWarehouseId, setSourceWarehouseId] = useState("");
  const [pricingStrategy, setPricingStrategy] = useState<
    "KEEP_ORIGINAL" | "NEW_PRICE"
  >("KEEP_ORIGINAL");
  const [newSalePrice, setNewSalePrice] = useState<number>(0);
  const [reason, setReason] = useState("");

  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);
  const { data: productsData } = useProducts({
    limit: 100,
    statuses: ["ACTIVE"],
    ...(selectedCompanyId && { companyId: selectedCompanyId }),
  });
  const { data: warehousesData } = useWarehouses({
    statuses: ["ACTIVE"],
    limit: 100,
  });
  const swapMutation = useSwapSaleLine();

  const productOptions = useMemo(() => {
    if (!productsData?.data) return [];
    return productsData.data
      .filter((p) => p.id !== line.productId)
      .map((p) => ({
        value: p.id,
        label: p.name,
        description: p.sku,
      }));
  }, [productsData, line.productId]);

  const warehouseOptions = useMemo(() => {
    if (!warehousesData?.data) return [];
    return warehousesData.data.map((w) => ({
      value: w.id,
      label: w.name,
    }));
  }, [warehousesData]);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!replacementProductId)
      errors.push(t("swapLine.validationProductRequired"));
    if (swapQuantity <= 0) errors.push(t("swapLine.validationQuantityMin"));
    if (swapQuantity > line.quantity)
      errors.push(t("swapLine.validationQuantityMax", { max: line.quantity }));
    if (!sourceWarehouseId)
      errors.push(t("swapLine.validationWarehouseRequired"));
    if (pricingStrategy === "NEW_PRICE" && (!newSalePrice || newSalePrice <= 0))
      errors.push(t("swapLine.validationPriceRequired"));
    return errors;
  }, [
    replacementProductId,
    swapQuantity,
    sourceWarehouseId,
    pricingStrategy,
    newSalePrice,
    line.quantity,
    t,
  ]);

  const isValid = validationErrors.length === 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      await swapMutation.mutateAsync({
        saleId,
        data: {
          lineId: line.id,
          replacementProductId,
          swapQuantity,
          sourceWarehouseId,
          pricingStrategy,
          ...(pricingStrategy === "NEW_PRICE" ? { newSalePrice } : {}),
          ...(saleCurrency ? { currency: saleCurrency } : {}),
          ...(reason ? { reason } : {}),
        },
      });
      onOpenChange(false);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("swapLine.title")}</DialogTitle>
          <DialogDescription>{t("swapLine.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("swapLine.replacementProduct")}</Label>
            <SearchableSelect
              options={productOptions}
              value={replacementProductId}
              onValueChange={setReplacementProductId}
              placeholder={t("swapLine.replacementProductPlaceholder")}
              searchPlaceholder={tCommon("search")}
              emptyMessage={t("swapLine.noProducts")}
              disabled={swapMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="swapQuantity">{t("swapLine.swapQuantity")}</Label>
            <Input
              id="swapQuantity"
              type="number"
              min={0.01}
              max={line.quantity}
              step="any"
              value={swapQuantity}
              onChange={(e) => setSwapQuantity(parseFloat(e.target.value) || 0)}
              disabled={swapMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("swapLine.sourceWarehouse")}</Label>
            <Select
              value={sourceWarehouseId}
              onValueChange={setSourceWarehouseId}
              disabled={swapMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("swapLine.sourceWarehousePlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {warehouseOptions.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    {t("swapLine.noWarehouses")}
                  </div>
                ) : (
                  warehouseOptions.map((w) => (
                    <SelectItem key={w.value} value={w.value}>
                      {w.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("swapLine.pricingStrategy")}</Label>
            <Select
              value={pricingStrategy}
              onValueChange={(v) =>
                setPricingStrategy(v as "KEEP_ORIGINAL" | "NEW_PRICE")
              }
              disabled={swapMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KEEP_ORIGINAL">
                  {t("swapLine.keepOriginal")}
                </SelectItem>
                <SelectItem value="NEW_PRICE">
                  {t("swapLine.newPrice")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {pricingStrategy === "NEW_PRICE" && (
            <div className="space-y-2">
              <Label htmlFor="newSalePrice">{t("swapLine.newSalePrice")}</Label>
              <CurrencyInput
                id="newSalePrice"
                value={newSalePrice}
                onChange={setNewSalePrice}
                disabled={swapMutation.isPending}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="swapReason">{t("swapLine.reason")}</Label>
            <Input
              id="swapReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("swapLine.reasonPlaceholder")}
              disabled={swapMutation.isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={swapMutation.isPending}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || swapMutation.isPending}
          >
            {swapMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {swapMutation.isPending ? tCommon("loading") : t("swapLine.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
