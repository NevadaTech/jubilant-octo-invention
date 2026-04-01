"use client";

import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { ProductSearchSelect } from "@/modules/inventory/presentation/components/shared/product-search-select";
import { useCompanyStore } from "@/modules/companies/infrastructure/store/company.store";
import type { ComboItemFormData } from "@/modules/inventory/presentation/schemas/combo.schema";

interface ComboItemSelectorProps {
  items: ComboItemFormData[];
  onChange: (items: ComboItemFormData[]) => void;
  disabled?: boolean;
  error?: string;
}

export function ComboItemSelector({
  items,
  onChange,
  disabled = false,
  error,
}: ComboItemSelectorProps) {
  const t = useTranslations("inventory.combos");
  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);

  const handleProductChange = (index: number, productId: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], productId };
    onChange(updated);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], quantity };
    onChange(updated);
  };

  const handleAddRow = () => {
    onChange([...items, { productId: "", quantity: 1 }]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <Label>{t("fields.items")} *</Label>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            // eslint-disable-next-line @eslint-react/no-array-index-key
            key={index}
            className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
          >
            <div className="flex-1">
              <ProductSearchSelect
                value={item.productId}
                onValueChange={(val) => handleProductChange(index, val)}
                companyId={selectedCompanyId ?? undefined}
                placeholder={t("form.selectProduct")}
                searchPlaceholder={t("form.searchProduct")}
                emptyMessage={t("form.noProducts")}
                disabled={disabled}
              />
            </div>

            <div className="w-24">
              <Input
                type="number"
                min={1}
                step={1}
                value={item.quantity}
                onChange={(e) =>
                  handleQuantityChange(
                    index,
                    Math.max(1, parseInt(e.target.value, 10) || 1),
                  )
                }
                placeholder={t("fields.quantity")}
                disabled={disabled}
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveRow(index)}
              disabled={disabled || items.length <= 1}
              title={t("form.removeItem")}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddRow}
        disabled={disabled}
      >
        <Plus className="mr-2 h-4 w-4" />
        {t("form.addItem")}
      </Button>
    </div>
  );
}
