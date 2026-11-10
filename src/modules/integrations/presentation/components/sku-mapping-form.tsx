"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { FormField } from "@/ui/components/form-field";
import { SearchableSelect } from "@/ui/components/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { useCreateSkuMapping } from "@/modules/integrations/presentation/hooks/use-integrations";
import { ProductSearchSelect } from "@/modules/inventory/presentation/components/shared/product-search-select";
import { useCombos } from "@/modules/inventory/presentation/hooks/use-combos";
import { cn } from "@/ui/lib/utils";

interface SkuMappingFormProps {
  connectionId: string;
  defaultExternalSku?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  framed?: boolean;
}

export function SkuMappingForm({
  connectionId,
  defaultExternalSku,
  onSuccess,
  onCancel,
  framed = true,
}: SkuMappingFormProps) {
  const t = useTranslations("integrations.skuMapping");
  const tCommon = useTranslations("common");
  const createMapping = useCreateSkuMapping(connectionId);
  const { data: combosResult } = useCombos({ limit: 200, isActive: true });
  const combos = combosResult?.data ?? [];

  const [mapType, setMapType] = useState<"product" | "combo">("product");
  const [externalSku, setExternalSku] = useState(defaultExternalSku || "");
  const [productId, setProductId] = useState("");
  const [comboId, setComboId] = useState("");
  const [errors, setErrors] = useState<{
    externalSku?: string;
    productId?: string;
    comboId?: string;
  }>({});

  const comboOptions = useMemo(
    () =>
      combos.map((c) => ({
        value: c.id,
        label: c.name,
        description: `SKU: ${c.sku}`,
      })),
    [combos],
  );

  const validate = () => {
    const newErrors: {
      externalSku?: string;
      productId?: string;
      comboId?: string;
    } = {};
    if (!externalSku.trim()) newErrors.externalSku = t("externalSkuRequired");
    if (mapType === "product" && !productId)
      newErrors.productId = t("productRequired");
    if (mapType === "combo" && !comboId) newErrors.comboId = t("comboRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMapping.mutateAsync({
        externalSku: externalSku.trim(),
        productId: mapType === "product" ? productId : comboId,
      });
      setExternalSku("");
      setProductId("");
      setComboId("");
      setErrors({});
      onSuccess?.();
    } catch {
      // handled by mutation
    }
  };

  const handleMapTypeChange = (value: string) => {
    setMapType(value as "product" | "combo");
    setProductId("");
    setComboId("");
    setErrors({});
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "space-y-4",
        framed && "rounded-xl border border-border bg-card p-5",
      )}
    >
      {framed ? (
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">{t("title")}</h3>
          <p className="text-sm text-muted-foreground">{t("comboHint")}</p>
        </div>
      ) : null}

      <FormField error={errors.externalSku}>
        <Label
          htmlFor={`external-sku-${connectionId}`}
          className="text-[13px] font-semibold"
        >
          {t("externalSku")}
        </Label>
        <Input
          id={`external-sku-${connectionId}`}
          value={externalSku}
          onChange={(e) => setExternalSku(e.target.value)}
          placeholder={t("externalSkuPlaceholder")}
        />
      </FormField>

      <FormField>
        <Label className="text-[13px] font-semibold">{t("type")}</Label>
        <Select value={mapType} onValueChange={handleMapTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="product">{t("mapToProduct")}</SelectItem>
            <SelectItem value="combo">{t("mapToCombo")}</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      {mapType === "product" ? (
        <FormField error={errors.productId}>
          <Label className="text-[13px] font-semibold">{t("product")}</Label>
          <ProductSearchSelect
            value={productId}
            onValueChange={setProductId}
            placeholder={t("selectProduct")}
            searchPlaceholder={t("searchProduct")}
            emptyMessage={t("noProductsFound")}
          />
        </FormField>
      ) : (
        <FormField error={errors.comboId}>
          <Label className="text-[13px] font-semibold">{t("typeCombo")}</Label>
          <SearchableSelect
            options={comboOptions}
            value={comboId}
            onValueChange={setComboId}
            placeholder={t("selectCombo")}
            searchPlaceholder={t("searchCombo")}
            emptyMessage={t("noCombosFound")}
          />
        </FormField>
      )}

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            {tCommon("cancel")}
          </Button>
        ) : null}
        <Button type="submit" disabled={createMapping.isPending}>
          {createMapping.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {t("add")}
        </Button>
      </div>
    </form>
  );
}
