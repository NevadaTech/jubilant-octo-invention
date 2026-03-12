"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { FormField } from "@/ui/components/form-field";
import { SearchableSelect } from "@/ui/components/searchable-select";
import { useCreateSkuMapping } from "@/modules/integrations/presentation/hooks/use-integrations";
import { useProducts } from "@/modules/inventory/presentation/hooks/use-products";

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

  const [externalSku, setExternalSku] = useState(defaultExternalSku || "");
  const [productId, setProductId] = useState("");
  const [errors, setErrors] = useState<{
    externalSku?: string;
    productId?: string;
  }>({});

  const productOptions = products.map((p) => ({
    value: p.id,
    label: p.name,
    description: `SKU: ${p.sku}`,
  }));

  const validate = () => {
    const newErrors: { externalSku?: string; productId?: string } = {};
    if (!externalSku.trim()) newErrors.externalSku = t("externalSkuRequired");
    if (!productId) newErrors.productId = t("productRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMapping.mutateAsync({
        externalSku: externalSku.trim(),
        productId,
      });
      setExternalSku("");
      setProductId("");
      setErrors({});
      onSuccess?.();
    } catch {
      // handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <FormField error={errors.externalSku} className="flex-1">
        <Input
          value={externalSku}
          onChange={(e) => setExternalSku(e.target.value)}
          placeholder={t("externalSkuPlaceholder")}
        />
      </FormField>
      <FormField error={errors.productId} className="flex-1">
        <SearchableSelect
          options={productOptions}
          value={productId}
          onValueChange={setProductId}
          placeholder={t("selectProduct")}
          searchPlaceholder={t("searchProduct")}
          emptyMessage={t("noProductsFound")}
        />
      </FormField>
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
