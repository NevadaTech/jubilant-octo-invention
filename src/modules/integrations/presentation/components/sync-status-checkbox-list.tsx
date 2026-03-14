"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Badge } from "@/ui/components/badge";
import { Label } from "@/ui/components/label";
import type { SyncStatusOption } from "@/modules/integrations/domain/constants/sync-statuses";

interface SyncStatusCheckboxListProps {
  statuses: SyncStatusOption[];
  selected: string[];
  onToggle: (value: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  providerKey: "vtex" | "meli";
  showWarningBanner?: boolean;
}

export function SyncStatusCheckboxList({
  statuses,
  selected,
  onToggle,
  onToggleAll,
  allSelected,
  providerKey,
  showWarningBanner = true,
}: SyncStatusCheckboxListProps) {
  const t = useTranslations("integrations");

  return (
    <div className="space-y-3">
      {showWarningBanner && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
          <div className="flex gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {t("initialSync.warningBanner")}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label className="text-sm">{t("initialSync.selectStates")}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs"
          onClick={onToggleAll}
        >
          {allSelected
            ? t("initialSync.deselectAll")
            : t("initialSync.selectAll")}
        </Button>
      </div>

      <div className="space-y-1.5">
        {statuses.map((status) => {
          const isSelected = selected.includes(status.value);
          return (
            <label
              key={status.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 ${
                isSelected
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-muted/20 hover:bg-muted/40"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(status.value)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary"
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-medium leading-tight">
                    {t(
                      `initialSync.states.${providerKey}.${status.value}.label` as never,
                    )}
                  </span>
                  {!status.safe && (
                    <Badge
                      variant="warning"
                      className="px-1.5 py-0 text-[10px] leading-4"
                    >
                      <AlertTriangle className="mr-0.5 h-2.5 w-2.5" />
                      {t("initialSync.inventoryWarning")}
                    </Badge>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t(
                    `initialSync.states.${providerKey}.${status.value}.desc` as never,
                  )}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
