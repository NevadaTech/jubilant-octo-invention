"use client";

import { useTranslations } from "next-intl";
import { Warehouse, ChevronDown } from "lucide-react";
import { Button } from "@/ui/components/button";
import {
  useWarehouses,
  useSelectedWarehouseId,
  useSetSelectedWarehouse,
} from "@/modules/inventory/presentation/hooks";

export function WarehouseSelector() {
  const t = useTranslations("inventory.warehouses");
  const selectedId = useSelectedWarehouseId();
  const setSelected = useSetSelectedWarehouse();
  const { data, isLoading } = useWarehouses({ isActive: true, limit: 100 });

  const selectedWarehouse = data?.data.find((w) => w.id === selectedId);

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="min-w-[200px]">
        <Warehouse className="mr-2 h-4 w-4" />
        {t("selector.loading")}
      </Button>
    );
  }

  return (
    <div className="relative">
      <select
        value={selectedId || ""}
        onChange={(e) => setSelected(e.target.value || null)}
        className="absolute inset-0 w-full cursor-pointer opacity-0"
        aria-label={t("selector.label")}
      >
        <option value="">{t("selector.all")}</option>
        {data?.data.map((warehouse) => (
          <option key={warehouse.id} value={warehouse.id}>
            {warehouse.displayName}
          </option>
        ))}
      </select>
      <Button
        variant="outline"
        className="min-w-[200px] justify-between pointer-events-none"
      >
        <span className="flex items-center">
          <Warehouse className="mr-2 h-4 w-4" />
          {selectedWarehouse
            ? selectedWarehouse.displayName
            : t("selector.all")}
        </span>
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
