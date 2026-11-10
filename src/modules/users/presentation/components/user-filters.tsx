"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { MultiSelect } from "@/ui/components/multi-select";
import { useDebounce } from "@/shared/presentation/hooks";
import type { UserFilters } from "@/modules/users/application/dto/user.dto";
import type { UserStatus } from "@/modules/users/domain/entities/user.entity";

interface UserFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
}

const USER_STATUSES: UserStatus[] = ["ACTIVE", "INACTIVE", "LOCKED"];

export function UserFiltersComponent({
  filters,
  onFiltersChange,
}: UserFiltersProps) {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const debouncedSearch = useDebounce(searchValue, 300);

  useEffect(() => {
    const currentSearch = filters.search || "";
    if (debouncedSearch !== currentSearch) {
      onFiltersChange({
        ...filters,
        search: debouncedSearch || undefined,
        page: 1,
      });
    }
  }, [debouncedSearch]);

  const handleStatusChange = (statuses: string[]) => {
    onFiltersChange({
      ...filters,
      status: statuses.length > 0 ? (statuses as UserStatus[]) : undefined,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setSearchValue("");
    onFiltersChange({
      page: 1,
      limit: filters.limit,
    });
  };

  const hasActiveFilters =
    (filters.status && filters.status.length > 0) || filters.search;

  const statusOptions = USER_STATUSES.map((s) => ({
    value: s,
    label: t(`status.${s.toLowerCase()}`),
  }));

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="w-full space-y-1 sm:w-64">
        <Label htmlFor="users-search">{tCommon("search")}</Label>
        <Input
          id="users-search"
          type="search"
          placeholder={t("search.placeholder")}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      <div className="w-full space-y-1 sm:w-56">
        <Label>{t("filters.status")}</Label>
        <MultiSelect
          value={filters.status || []}
          onValueChange={handleStatusChange}
          options={statusOptions}
          allLabel={t("filters.allStatuses")}
          selectedLabel={tCommon("selected")}
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
