"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Input } from "@/ui/components/input";
import { Button } from "@/ui/components/button";
import { Label } from "@/ui/components/label";
import { DateRangePicker } from "@/ui/components/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { useDebounce } from "@/shared/presentation/hooks";
import { useUsers } from "@/modules/users/presentation/hooks/use-users";
import type { AuditLogFilters } from "@/modules/audit/application/dto/audit-log.dto";
import type { DateRange } from "react-day-picker";

const ENTITY_TYPES = [
  "System",
  "User",
  "Role",
  "Product",
  "Category",
  "Warehouse",
  "Movement",
  "Transfer",
  "Stock",
  "Sale",
  "Return",
  "Report",
];

const ACTIONS = [
  "HTTP_REQUEST",
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "STATUS_CHANGE",
  "CONFIRM",
  "PICK",
  "SHIP",
  "COMPLETE",
  "VOID",
  "CANCEL",
  "EXPORT",
  "ASSIGN",
  "REMOVE",
];

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

interface Props {
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
}

export function AuditLogFiltersBar({ filters, onFiltersChange }: Props) {
  const t = useTranslations("audit");
  const tCommon = useTranslations("common");
  const [searchValue, setSearchValue] = useState(filters.entityId || "");
  const debouncedSearch = useDebounce(searchValue, 300);
  const { data: usersData } = useUsers({ limit: 100 });

  useEffect(() => {
    const currentSearch = filters.entityId || "";
    if (debouncedSearch !== currentSearch) {
      onFiltersChange({
        ...filters,
        entityId: debouncedSearch || undefined,
        page: 1,
      });
    }
  }, [debouncedSearch]);

  const handleEntityTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      entityType: value === "all" ? undefined : value,
      page: 1,
    });
  };

  const handleActionChange = (value: string) => {
    onFiltersChange({
      ...filters,
      action: value === "all" ? undefined : value,
      page: 1,
    });
  };

  const handlePerformedByChange = (value: string) => {
    onFiltersChange({
      ...filters,
      performedBy: value === "all" ? undefined : value,
      page: 1,
    });
  };

  const handleHttpMethodChange = (value: string) => {
    onFiltersChange({
      ...filters,
      httpMethod: value === "all" ? undefined : value,
      page: 1,
    });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    const startDate = range?.from
      ? format(range.from, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
      : undefined;
    const endDate = range?.to
      ? format(range.to, "yyyy-MM-dd'T'23:59:59.SSSxxx")
      : undefined;
    onFiltersChange({
      ...filters,
      startDate,
      endDate,
      page: 1,
    });
  };

  const hasActiveFilters =
    filters.entityType ||
    filters.action ||
    filters.performedBy ||
    filters.httpMethod ||
    filters.startDate ||
    filters.endDate ||
    filters.entityId;

  const handleClearFilters = () => {
    setSearchValue("");
    onFiltersChange({ page: 1, limit: filters.limit });
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="w-full space-y-1 sm:w-[220px]">
        <Label htmlFor="audit-entity">{t("filters.entityType")}</Label>
        <Select
          value={filters.entityType || "all"}
          onValueChange={handleEntityTypeChange}
        >
          <SelectTrigger id="audit-entity">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
            {ENTITY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full space-y-1 sm:w-[220px]">
        <Label htmlFor="audit-action">{t("filters.action")}</Label>
        <Select
          value={filters.action || "all"}
          onValueChange={handleActionChange}
        >
          <SelectTrigger id="audit-action">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allActions")}</SelectItem>
            {ACTIONS.map((action) => (
              <SelectItem key={action} value={action}>
                {action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full space-y-1 sm:w-[220px]">
        <Label>{t("filters.dateRange")}</Label>
        <DateRangePicker
          value={
            filters.startDate || filters.endDate
              ? {
                  from: filters.startDate
                    ? new Date(filters.startDate)
                    : undefined,
                  to: filters.endDate ? new Date(filters.endDate) : undefined,
                }
              : undefined
          }
          onChange={handleDateRangeChange}
          placeholder={t("filters.selectDateRange")}
        />
      </div>

      <div className="w-full space-y-1 sm:w-[220px]">
        <Label htmlFor="audit-actor">{t("filters.performedBy")}</Label>
        <Select
          value={filters.performedBy || "all"}
          onValueChange={handlePerformedByChange}
        >
          <SelectTrigger id="audit-actor">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allUsers")}</SelectItem>
            {usersData?.data.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full space-y-1 sm:w-[160px]">
        <Label htmlFor="audit-method">{t("filters.httpMethod")}</Label>
        <Select
          value={filters.httpMethod || "all"}
          onValueChange={handleHttpMethodChange}
        >
          <SelectTrigger id="audit-method">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allMethods")}</SelectItem>
            {HTTP_METHODS.map((method) => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full space-y-1 sm:w-52">
        <Label htmlFor="audit-entity-id">{t("filters.entityId")}</Label>
        <Input
          id="audit-entity-id"
          type="search"
          placeholder={t("filters.entityIdPlaceholder")}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
      </div>

      {hasActiveFilters ? (
        <Button type="button" variant="ghost" onClick={handleClearFilters}>
          {tCommon("clearFilters")}
        </Button>
      ) : null}
    </div>
  );
}
