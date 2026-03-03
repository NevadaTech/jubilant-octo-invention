"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
import { MultiSelect } from "@/ui/components/multi-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { useWarehouses } from "@/modules/inventory/presentation/hooks/use-warehouses";
import { useCategories } from "@/modules/inventory/presentation/hooks/use-categories";
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

const SALE_REPORT_STATUSES = [
  "DRAFT",
  "CONFIRMED",
  "PICKING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
  "RETURNED",
];

const RETURN_REPORT_STATUSES = ["DRAFT", "CONFIRMED", "CANCELLED"];

const MOVEMENT_TYPES = [
  "IN",
  "OUT",
  "ADJUST_IN",
  "ADJUST_OUT",
  "TRANSFER_IN",
  "TRANSFER_OUT",
];

const RETURN_TYPES = ["CUSTOMER", "SUPPLIER"];

const SEVERITIES = ["CRITICAL", "WARNING"];

// Sales reports exclude DRAFT by default
const SALE_DEFAULT_STATUSES = SALE_REPORT_STATUSES.filter((s) => s !== "DRAFT");

function isSalesReport(type: ReportTypeValue): boolean {
  return type === "SALES";
}

function getStatusOptions(type: ReportTypeValue): string[] {
  if (isSalesReport(type)) return SALE_REPORT_STATUSES;
  return RETURN_REPORT_STATUSES;
}

function getDefaultParams(type: ReportTypeValue): ReportParameters {
  if (isSalesReport(type)) {
    return { status: SALE_DEFAULT_STATUSES };
  }
  return {};
}

const DEBOUNCE_MS = 500;

export function ReportFiltersForm({
  type,
  onGenerate,
}: ReportFiltersFormProps) {
  const config = REPORT_FILTER_CONFIG[type];
  const t = useTranslations("reports");
  const tCommon = useTranslations("common");
  const defaultParams = useMemo(() => getDefaultParams(type), [type]);
  const [params, setParams] = useState<ReportParameters>(defaultParams);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRenderRef = useRef(true);

  const { data: warehouseData } = useWarehouses(
    config.warehouseIds ? {} : undefined,
  );
  const warehouses = warehouseData?.data ?? [];

  const { data: categoryData } = useCategories(
    config.categoryIds ? { statuses: ["ACTIVE"], limit: 100 } : undefined,
  );
  const categories = categoryData?.data ?? [];

  // Auto-generate on mount with defaults
  useEffect(() => {
    onGenerate(defaultParams);
  }, []);

  // Auto-generate when params change (debounced for text inputs)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onGenerate(params);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [params, onGenerate]);

  const set = (key: keyof ReportParameters, value: unknown) => {
    setParams((prev) => ({
      ...prev,
      [key]: value === "" || value === "all" ? undefined : value,
    }));
  };

  const setArray = (key: keyof ReportParameters, values: string[]) => {
    setParams((prev) => ({
      ...prev,
      [key]: values.length > 0 ? values : undefined,
    }));
  };

  const setDateRange = (field: "startDate" | "endDate", value: string) => {
    setParams((prev) => ({
      ...prev,
      dateRange: { ...prev.dateRange, [field]: value || undefined },
    }));
  };

  const clearAll = () => {
    setParams(defaultParams);
  };

  const hasFilters = Object.keys(params).some((k) => {
    if (k === "dateRange")
      return params.dateRange?.startDate || params.dateRange?.endDate;
    if (k === "status") {
      const defaultStatus = defaultParams.status;
      const currentStatus = params.status;
      if (!defaultStatus && !currentStatus) return false;
      if (!defaultStatus && currentStatus) return currentStatus.length > 0;
      if (defaultStatus && !currentStatus) return true;
      return JSON.stringify(currentStatus) !== JSON.stringify(defaultStatus);
    }
    const val = params[k as keyof ReportParameters];
    if (Array.isArray(val)) return val.length > 0;
    return val !== undefined;
  });

  const visibleCount = Object.values(config).filter(Boolean).length;
  if (visibleCount === 0) return null;

  const statusOptions = config.status
    ? getStatusOptions(type).map((s) => ({
        value: s,
        label: t(`status.${s}`),
      }))
    : [];

  const warehouseOptions = useMemo(
    () =>
      warehouses.map((w) => ({
        value: w.id,
        label: w.name,
      })),
    [warehouses],
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        value: c.id,
        label: c.name,
      })),
    [categories],
  );

  const movementTypeOptions = useMemo(
    () =>
      MOVEMENT_TYPES.map((mt) => ({
        value: mt,
        label: t(`movementType.${mt}`),
      })),
    [t],
  );

  const returnTypeOptions = useMemo(
    () =>
      RETURN_TYPES.map((rt) => ({
        value: rt,
        label: t(`returnType.${rt}`),
      })),
    [t],
  );

  const severityOptions = useMemo(
    () =>
      SEVERITIES.map((s) => ({
        value: s,
        label: t(`severity.${s}`),
      })),
    [t],
  );

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

          {config.warehouseIds && warehouses.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs">{t("filters.warehouse")}</Label>
              <MultiSelect
                value={params.warehouseIds ?? []}
                onValueChange={(v) => setArray("warehouseIds", v)}
                options={warehouseOptions}
                allLabel={t("filters.allWarehouses")}
                selectedLabel={t("filters.warehouse")}
                className="text-sm"
              />
            </div>
          )}

          {config.categoryIds && categories.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs">{t("filters.category")}</Label>
              <MultiSelect
                value={params.categoryIds ?? []}
                onValueChange={(v) => setArray("categoryIds", v)}
                options={categoryOptions}
                allLabel={t("filters.allCategories")}
                selectedLabel={t("filters.category")}
                className="text-sm"
              />
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
              <MultiSelect
                value={params.status || []}
                onValueChange={(statuses) =>
                  set("status", statuses.length > 0 ? statuses : undefined)
                }
                options={statusOptions}
                allLabel={t("filters.allStatuses")}
                selectedLabel={tCommon("selected")}
                className="text-sm"
              />
            </div>
          )}

          {config.returnTypes && (
            <div className="space-y-1.5">
              <Label className="text-xs">{t("filters.returnType")}</Label>
              <MultiSelect
                value={params.returnTypes ?? []}
                onValueChange={(v) => setArray("returnTypes", v)}
                options={returnTypeOptions}
                allLabel={t("filters.allReturnTypes")}
                selectedLabel={t("filters.returnType")}
                className="text-sm"
              />
            </div>
          )}

          {config.severities && (
            <div className="space-y-1.5">
              <Label className="text-xs">{t("filters.severity")}</Label>
              <MultiSelect
                value={params.severities ?? []}
                onValueChange={(v) => setArray("severities", v)}
                options={severityOptions}
                allLabel={t("filters.allSeverities")}
                selectedLabel={t("filters.severity")}
                className="text-sm"
              />
            </div>
          )}

          {config.movementTypes && (
            <div className="space-y-1.5">
              <Label className="text-xs">{t("filters.movementType")}</Label>
              <MultiSelect
                value={params.movementTypes ?? []}
                onValueChange={(v) => setArray("movementTypes", v)}
                options={movementTypeOptions}
                allLabel={t("filters.allMovementTypes")}
                selectedLabel={t("filters.movementType")}
                className="text-sm"
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
      </CardContent>
    </Card>
  );
}
