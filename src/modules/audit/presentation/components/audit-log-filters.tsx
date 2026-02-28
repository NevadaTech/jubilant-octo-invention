"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, X, Filter, Calendar } from "lucide-react";
import { Input } from "@/ui/components/input";
import { Button } from "@/ui/components/button";
import { Label } from "@/ui/components/label";
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
  const [showFilters, setShowFilters] = useState(false);
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

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      startDate: e.target.value
        ? new Date(e.target.value).toISOString()
        : undefined,
      page: 1,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      endDate: e.target.value
        ? new Date(e.target.value + "T23:59:59").toISOString()
        : undefined,
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
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={
              t("filters.entityIdPlaceholder") || "Search by Entity ID..."
            }
            className="pl-9"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {tCommon("filter")}
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              !
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="mr-2 h-4 w-4" />
            {tCommon("clearFilters")}
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[140px]">
              <Label className="mb-2 block text-sm">
                {t("filters.entityType")}
              </Label>
              <Select
                value={filters.entityType || "all"}
                onValueChange={handleEntityTypeChange}
              >
                <SelectTrigger>
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

            <div className="min-w-[140px]">
              <Label className="mb-2 block text-sm">
                {t("filters.action")}
              </Label>
              <Select
                value={filters.action || "all"}
                onValueChange={handleActionChange}
              >
                <SelectTrigger>
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

            <div className="min-w-[140px]">
              <Label className="mb-2 block text-sm">
                {t("filters.httpMethod")}
              </Label>
              <Select
                value={filters.httpMethod || "all"}
                onValueChange={handleHttpMethodChange}
              >
                <SelectTrigger>
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

            <div className="min-w-[170px]">
              <Label className="mb-2 block text-sm">
                {t("filters.performedBy")}
              </Label>
              <Select
                value={filters.performedBy || "all"}
                onValueChange={handlePerformedByChange}
              >
                <SelectTrigger>
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
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[150px]">
              <Label className="mb-2 block text-sm">
                {t("filters.startDate")}
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-9"
                  onChange={handleStartDateChange}
                />
              </div>
            </div>

            <div className="min-w-[150px]">
              <Label className="mb-2 block text-sm">
                {t("filters.endDate")}
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-9"
                  onChange={handleEndDateChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
