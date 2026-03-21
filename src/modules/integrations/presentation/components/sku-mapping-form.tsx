"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
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
import { useProducts } from "@/modules/inventory/presentation/hooks/use-products";
import { useCombos } from "@/modules/inventory/presentation/hooks/use-combos";

interface SkuMappingFormProps {
  connectionId: string;
  defaultExternalSku?: string;
  onSuccess?: () => void;
}

export function SkuMappingForm({
  connectionId,
  defaultExternalSku,
  onSuccess,
}: SkuMappingFormProps) {
  const t = useTranslations("integrations.skuMapping");
  const createMapping = useCreateSkuMapping(connectionId);
  const { data: productsResult } = useProducts({
    status: "ACTIVE",
    limit: 200,
  } as never);
  const products = productsResult?.data ?? [];
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

  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        value: p.id,
        label: p.name,
        description: `SKU: ${p.sku}`,
      })),
    [products],
  );

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
    <form onSubmit={handleSubmit} className="flex items-end gap-3 flex-wrap">
      <FormField error={errors.externalSku} className="flex-1 min-w-[150px]">
        <Input
          value={externalSku}
          onChange={(e) => setExternalSku(e.target.value)}
          placeholder={t("externalSkuPlaceholder")}
        />
      </FormField>
      <FormField className="w-[160px]">
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
        <FormField error={errors.productId} className="flex-1 min-w-[200px]">
          <SearchableSelect
            options={productOptions}
            value={productId}
            onValueChange={setProductId}
            placeholder={t("selectProduct")}
            searchPlaceholder={t("searchProduct")}
            emptyMessage={t("noProductsFound")}
          />
        </FormField>
      ) : (
        <FormField error={errors.comboId} className="flex-1 min-w-[200px]">
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
      <Button type="submit" size="sm" disabled={createMapping.isPending}>
        {createMapping.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {t("add")}
      </Button>
    </form>
  );
}
