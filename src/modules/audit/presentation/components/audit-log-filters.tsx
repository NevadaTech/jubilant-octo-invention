"use client";

import { useTranslations } from "next-intl";
import { X, Calendar, Search } from "lucide-react";
import { Input } from "@/ui/components/input";
import { Button } from "@/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { useUsers } from "@/modules/users/presentation/hooks/use-users";
import type { AuditLogFilters } from "../../application/dto/audit-log.dto";

const ENTITY_TYPES = [
  "System",
  "User",
  "Role",
  "Product",
  "Category",
  "Warehouse",
  "Movement",
  "Transfer",
  "Sale",
  "Return",
  "StockLevel",
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
  const { data: usersData } = useUsers({ limit: 100 });

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

  const handleEntityIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    onFiltersChange({
      ...filters,
      entityId: value || undefined,
      page: 1,
    });
  };

  const handlePageSizeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      limit: parseInt(value),
      page: 1,
    });
  };

  const hasFilters =
    filters.entityType ||
    filters.action ||
    filters.performedBy ||
    filters.httpMethod ||
    filters.entityId ||
    filters.startDate ||
    filters.endDate;

  const clearFilters = () => {
    onFiltersChange({ page: 1, limit: filters.limit });
  };

  return (
    <div className="space-y-3">
      {/* Row 1: Main filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[140px]">
          <label className="mb-1 block text-sm text-muted-foreground">
            {t("filters.entityType")}
          </label>
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
          <label className="mb-1 block text-sm text-muted-foreground">
            {t("filters.action")}
          </label>
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
          <label className="mb-1 block text-sm text-muted-foreground">
            {t("filters.httpMethod")}
          </label>
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
          <label className="mb-1 block text-sm text-muted-foreground">
            {t("filters.performedBy")}
          </label>
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

      {/* Row 2: Date range, entity ID search, page size, clear */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[150px]">
          <label className="mb-1 block text-sm text-muted-foreground">
            {t("filters.startDate")}
          </label>
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
          <label className="mb-1 block text-sm text-muted-foreground">
            {t("filters.endDate")}
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              className="pl-9"
              onChange={handleEndDateChange}
            />
          </div>
        </div>

        <div className="min-w-[180px]">
          <label className="mb-1 block text-sm text-muted-foreground">
            {t("filters.entityId")}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("filters.entityIdPlaceholder")}
              className="pl-9"
              onChange={handleEntityIdChange}
            />
          </div>
        </div>

        <div className="min-w-[100px]">
          <label className="mb-1 block text-sm text-muted-foreground">
            {t("filters.pageSize")}
          </label>
          <Select
            value={String(filters.limit || 20)}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            {t("filters.clear")}
          </Button>
        )}
      </div>
    </div>
  );
}
