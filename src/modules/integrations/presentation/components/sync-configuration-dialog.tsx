"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/dialog";
import { Button } from "@/ui/components/button";
import { Label } from "@/ui/components/label";
import { DatePicker } from "@/ui/components/date-picker";
import { SyncStatusCheckboxList } from "./sync-status-checkbox-list";
import type { IntegrationProvider } from "@/modules/integrations/domain/entities/integration-connection.entity";
import {
  getSyncStatusesForProvider,
  getDefaultSelectedStatuses,
  getProviderKey,
} from "@/modules/integrations/domain/constants/sync-statuses";

interface SyncConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: IntegrationProvider;
  lastSyncAt?: Date | null;
  onConfirm: (config: { fromDate?: string; statuses: string[] }) => void;
  isPending?: boolean;
}

export function SyncConfigurationDialog({
  open,
  onOpenChange,
  provider,
  lastSyncAt,
  onConfirm,
  isPending,
}: SyncConfigurationDialogProps) {
  const t = useTranslations("integrations");
  const tCommon = useTranslations("common");

  const statusOptions = getSyncStatusesForProvider(provider);
  const defaultSelected = useMemo(
    () => getDefaultSelectedStatuses(provider),
    [provider],
  );
  const providerKey = getProviderKey(provider);

  const [syncFromDate, setSyncFromDate] = useState<Date | undefined>(() =>
    lastSyncAt ? new Date(lastSyncAt) : new Date(),
  );
  const [selected, setSelected] = useState<string[]>(() => defaultSelected);

  useEffect(() => {
    if (open) {
      setSyncFromDate(lastSyncAt ? new Date(lastSyncAt) : new Date());
      setSelected(defaultSelected);
    }
  }, [open, lastSyncAt, defaultSelected]);

  const handleToggle = useCallback((value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }, []);

  const allSelected = selected.length === statusOptions.length;

  const handleToggleAll = useCallback(() => {
    setSelected(allSelected ? [] : statusOptions.map((s) => s.value));
  }, [allSelected, statusOptions]);

  const handleConfirm = () => {
    const fromDate = syncFromDate?.toISOString().split("T")[0];
    onConfirm({ fromDate, statuses: selected });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("actions.syncDialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("actions.syncDialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-1 flex-1 space-y-4 overflow-y-auto px-1">
          <div className="space-y-2">
            <Label>{t("actions.syncFromDate")}</Label>
            <DatePicker
              value={syncFromDate}
              onChange={(date) => setSyncFromDate(date)}
              maxDate={new Date()}
            />
            <p className="text-xs text-muted-foreground">
              {t("actions.syncDialogDateHelper")}
            </p>
          </div>

          <SyncStatusCheckboxList
            statuses={statusOptions}
            selected={selected}
            onToggle={handleToggle}
            onToggleAll={handleToggleAll}
            allSelected={allSelected}
            providerKey={providerKey}
            showWarningBanner={false}
          />
        </div>

        <DialogFooter className="gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selected.length === 0 || isPending}
          >
            {t("actions.syncDialogConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
