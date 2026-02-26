"use client";

import { useState } from "react";
import { CalendarIcon, FilterX } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { useWarehouses } from "@/modules/inventory/presentation/hooks/use-warehouses";
import type {
  ReportTypeValue,
  ReportParameters,
} from "@/modules/reports/application/dto/report.dto";
import { REPORT_FILTER_CONFIG } from "@/modules/reports/application/dto/report.dto";

interface ReportFiltersFormProps {
  type: ReportTypeValue;
  onGenerate: (params: ReportParameters) => void;
  loading?: boolean;
}

const EMPTY_PARAMS: ReportParameters = {};

export function ReportFiltersForm({
  type,
  onGenerate,
  loading,
}: ReportFiltersFormProps) {
  const config = REPORT_FILTER_CONFIG[type];
  const t = useTranslations("reports");
  const [params, setParams] = useState<ReportParameters>(EMPTY_PARAMS);

  const { data: warehouseData } = useWarehouses(
    config.warehouseId ? {} : undefined,
  );
  const warehouses = warehouseData?.data ?? [];

  const set = (key: keyof ReportParameters, value: unknown) => {
    setParams((prev) => ({
      ...prev,
      [key]: value === "" || value === "all" ? undefined : value,
    }));
  };

  const setDateRange = (field: "startDate" | "endDate", value: string) => {
    setParams((prev) => ({
      ...prev,
      dateRange: { ...prev.dateRange, [field]: value || undefined },
    }));
  };

  const clearAll = () => setParams(EMPTY_PARAMS);

  const hasFilters = Object.keys(params).some((k) => {
    if (k === "dateRange")
      return params.dateRange?.startDate || params.dateRange?.endDate;
    return params[k as keyof ReportParameters] !== undefined;
  });

  const visibleCount = Object.values(config).filter(Boolean).length;
  if (visibleCount === 0) {
    return (
      <div className="flex justify-end">
        <Button
          onClick={() => onGenerate({})}
          disabled={loading}
          className="min-w-32"
        >
          {loading ? t("generating") : t("generate")}
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("filters.title")}
          </CardTitle>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-7 gap-1 text-xs text-muted-foreground"
            >
              <FilterX className="h-3.5 w-3.5" />
              {t("filters.clear")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {config.dateRange && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("filters.startDate")}</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-8 text-sm"
                    value={params.dateRange?.startDate ?? ""}
                    onChange={(e) => setDateRange("startDate", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("filters.endDate")}</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-8 text-sm"
                    value={params.dateRange?.endDate ?? ""}
                    onChange={(e) => setDateRange("endDate", e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {config.warehouseId && warehouses.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs">{t("filters.warehouse")}</Label>
              <Select
                value={params.warehouseId ?? "all"}
                onValueChange={(v) => set("warehouseId", v)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder={t("filters.allWarehouses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("filters.allWarehouses")}
                  </SelectItem>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {config.period && (
            <div className="space-y-1.5">
              <Label className="text-xs">{t("filters.period")}</Label>
              <Select
                value={params.period ?? "all"}
                onValueChange={(v) => set("period", v)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder={t("filters.selectPeriod")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("filters.selectPeriod")}
                  </SelectItem>
                  <SelectItem value="MONTHLY">{t("period.MONTHLY")}</SelectItem>
                  <SelectItem value="QUARTERLY">
                    {t("period.QUARTERLY")}
                  </SelectItem>
                  <SelectItem value="YEARLY">{t("period.YEARLY")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {config.groupBy && (
            <div className="space-y-1.5">
              <Label className="text-xs">{t("filters.groupBy")}</Label>
              <Select
                value={params.groupBy ?? "all"}
                onValueChange={(v) => set("groupBy", v)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder={t("filters.selectGroupBy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("filters.selectGroupBy")}
                  </SelectItem>
                  <SelectItem value="DAY">{t("groupBy.DAY")}</SelectItem>
                  <SelectItem value="WEEK">{t("groupBy.WEEK")}</SelectItem>
                  <SelectItem value="MONTH">{t("groupBy.MONTH")}</SelectItem>
                  <SelectItem value="PRODUCT">
                    {t("groupBy.PRODUCT")}
                  </SelectItem>
                  <SelectItem value="WAREHOUSE">
                    {t("groupBy.WAREHOUSE")}
                  </SelectItem>
                  <SelectItem value="CUSTOMER">
                    {t("groupBy.CUSTOMER")}
                  </SelectItem>
                  <SelectItem value="TYPE">{t("groupBy.TYPE")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {config.status && (
            <div className="space-y-1.5">
              <Label className="text-xs">{t("filters.status")}</Label>
              <Select
                value={params.status ?? "all"}
                onValueChange={(v) => set("status", v)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder={t("filters.allStatuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("filters.allStatuses")}
                  </SelectItem>
                  <SelectItem value="DRAFT">{t("status.DRAFT")}</SelectItem>
                  <SelectItem value="CONFIRMED">
                    {t("status.CONFIRMED")}
                  </SelectItem>
                  <SelectItem value="CANCELLED">
                    {t("status.CANCELLED")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {config.returnType && (
            <div className="space-y-1.5">
              <Label className="text-xs">{t("filters.returnType")}</Label>
              <Select
                value={params.returnType ?? "all"}
                onValueChange={(v) => set("returnType", v)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder={t("filters.allReturnTypes")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("filters.allReturnTypes")}
                  </SelectItem>
                  <SelectItem value="CUSTOMER">
                    {t("returnType.CUSTOMER")}
                  </SelectItem>
                  <SelectItem value="SUPPLIER">
                    {t("returnType.SUPPLIER")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {config.severity && (
            <div className="space-y-1.5">
              <Label className="text-xs">{t("filters.severity")}</Label>
              <Select
                value={params.severity ?? "all"}
                onValueChange={(v) => set("severity", v)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder={t("filters.allSeverities")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("filters.allSeverities")}
                  </SelectItem>
                  <SelectItem value="CRITICAL">
                    {t("severity.CRITICAL")}
                  </SelectItem>
                  <SelectItem value="WARNING">
                    {t("severity.WARNING")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {config.movementType && (
            <div className="space-y-1.5">
              <Label className="text-xs">{t("filters.movementType")}</Label>
              <Select
                value={params.movementType ?? "all"}
                onValueChange={(v) => set("movementType", v)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder={t("filters.allMovementTypes")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("filters.allMovementTypes")}
                  </SelectItem>
                  <SelectItem value="IN">{t("movementType.IN")}</SelectItem>
                  <SelectItem value="OUT">{t("movementType.OUT")}</SelectItem>
                  <SelectItem value="ADJUSTMENT">
                    {t("movementType.ADJUSTMENT")}
                  </SelectItem>
                  <SelectItem value="TRANSFER_IN">
                    {t("movementType.TRANSFER_IN")}
                  </SelectItem>
                  <SelectItem value="TRANSFER_OUT">
                    {t("movementType.TRANSFER_OUT")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {config.category && (
            <div className="space-y-1.5">
              <Label className="text-xs">{t("filters.category")}</Label>
              <Input
                type="text"
                placeholder={t("filters.allCategories")}
                className="text-sm"
                value={params.category ?? ""}
                onChange={(e) => set("category", e.target.value)}
              />
            </div>
          )}

          {config.deadStockDays && (
            <div className="space-y-1.5">
              <Label className="text-xs">{t("filters.deadStockDays")}</Label>
              <Input
                type="number"
                min={1}
                placeholder="90"
                className="text-sm"
                value={params.deadStockDays ?? ""}
                onChange={(e) =>
                  set(
                    "deadStockDays",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            </div>
          )}

          {config.includeInactive && (
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  checked={params.includeInactive ?? false}
                  onChange={(e) =>
                    set("includeInactive", e.target.checked || undefined)
                  }
                />
                <span>{t("filters.includeInactive")}</span>
              </label>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => onGenerate(params)}
            disabled={loading}
            className="min-w-36"
          >
            {loading ? t("generating") : t("generate")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
