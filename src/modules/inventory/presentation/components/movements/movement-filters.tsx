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
import type { StockMovementFilters } from "../../../application/dto/stock-movement.dto";
import type {
  MovementType,
  MovementStatus,
} from "../../../domain/entities/stock-movement.entity";

interface MovementFiltersProps {
  filters: StockMovementFilters;
  onFiltersChange: (filters: StockMovementFilters) => void;
}

export function MovementFilters({
  filters,
  onFiltersChange,
}: MovementFiltersProps) {
  const t = useTranslations("inventory.movements");

  const handleTypeChange = (type: string) => {
    onFiltersChange({
      ...filters,
      type: type === "all" ? undefined : (type as MovementType),
      page: 1,
    });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status === "all" ? undefined : (status as MovementStatus),
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
    filters.type || filters.status || filters.startDate || filters.endDate;

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="min-w-[150px]">
        <Label className="text-sm">{t("filters.type")}</Label>
        <Select value={filters.type || "all"} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
            <SelectItem value="IN">{t("types.in")}</SelectItem>
            <SelectItem value="OUT">{t("types.out")}</SelectItem>
            <SelectItem value="ADJUST_IN">{t("types.adjust_in")}</SelectItem>
            <SelectItem value="ADJUST_OUT">{t("types.adjust_out")}</SelectItem>
            <SelectItem value="TRANSFER_IN">
              {t("types.transfer_in")}
            </SelectItem>
            <SelectItem value="TRANSFER_OUT">
              {t("types.transfer_out")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

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
            <SelectItem value="POSTED">{t("status.posted")}</SelectItem>
            <SelectItem value="VOID">{t("status.void")}</SelectItem>
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
