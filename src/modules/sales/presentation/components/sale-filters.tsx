"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import type { SaleFilters } from "../../application/dto/sale.dto";
import type { SaleStatus } from "../../domain/entities/sale.entity";

interface SaleFiltersProps {
  filters: SaleFilters;
  onFiltersChange: (filters: SaleFilters) => void;
}

export function SaleFiltersComponent({
  filters,
  onFiltersChange,
}: SaleFiltersProps) {
  const t = useTranslations("sales");

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status === "all" ? undefined : (status as SaleStatus),
      page: 1,
    });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      startDate: e.target.value || undefined,
      page: 1,
    });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      endDate: e.target.value || undefined,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit,
    });
  };

  const hasActiveFilters =
    filters.status || filters.startDate || filters.endDate;

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="min-w-[150px]">
        <Label className="text-sm">{t("filters.status")}</Label>
        <Select
          value={filters.status || "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allStatuses")}</SelectItem>
            <SelectItem value="DRAFT">{t("status.draft")}</SelectItem>
            <SelectItem value="CONFIRMED">{t("status.confirmed")}</SelectItem>
            <SelectItem value="PICKING">{t("status.picking")}</SelectItem>
            <SelectItem value="SHIPPED">{t("status.shipped")}</SelectItem>
            <SelectItem value="COMPLETED">{t("status.completed")}</SelectItem>
            <SelectItem value="CANCELLED">{t("status.cancelled")}</SelectItem>
            <SelectItem value="RETURNED">{t("status.returned")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm">{t("filters.dateFrom")}</Label>
        <Input
          type="date"
          value={filters.startDate || ""}
          onChange={handleDateFromChange}
          className="w-auto"
        />
      </div>

      <div>
        <Label className="text-sm">{t("filters.dateTo")}</Label>
        <Input
          type="date"
          value={filters.endDate || ""}
          onChange={handleDateToChange}
          className="w-auto"
        />
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          <X className="mr-2 h-4 w-4" />
          {t("filters.clear")}
        </Button>
      )}
    </div>
  );
}
