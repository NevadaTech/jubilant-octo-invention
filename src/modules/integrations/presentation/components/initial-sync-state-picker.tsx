"use client";

import { useState, useCallback } from "react";
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
import { SyncStatusCheckboxList } from "./sync-status-checkbox-list";
import type { IntegrationProvider } from "@/modules/integrations/domain/entities/integration-connection.entity";
import {
  getSyncStatusesForProvider,
  getDefaultSelectedStatuses,
  getProviderKey,
} from "@/modules/integrations/domain/constants/sync-statuses";

interface InitialSyncStatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: IntegrationProvider;
  onConfirm: (statuses: string[]) => void;
  isPending?: boolean;
}

export function InitialSyncStatePicker({
  open,
  onOpenChange,
  provider,
  onConfirm,
  isPending,
}: InitialSyncStatePickerProps) {
  const t = useTranslations("integrations");
  const tCommon = useTranslations("common");

  const statusOptions = getSyncStatusesForProvider(provider);
  const defaultSelected = getDefaultSelectedStatuses(provider);
  const providerKey = getProviderKey(provider);

  const [selected, setSelected] = useState<string[]>(defaultSelected);

  const handleToggle = useCallback((value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }, []);

  const allSelected = selected.length === statusOptions.length;

  const handleToggleAll = useCallback(() => {
    setSelected(allSelected ? [] : statusOptions.map((s) => s.value));
  }, [allSelected, statusOptions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("initialSync.title")}</DialogTitle>
          <DialogDescription>{t("initialSync.description")}</DialogDescription>
        </DialogHeader>

        <div className="-mx-1 flex-1 overflow-y-auto px-1">
          <SyncStatusCheckboxList
            statuses={statusOptions}
            selected={selected}
            onToggle={handleToggle}
            onToggleAll={handleToggleAll}
            allSelected={allSelected}
            providerKey={providerKey}
          />
        </div>

        <DialogFooter className="gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={() => onConfirm(selected)}
            disabled={selected.length === 0 || isPending}
          >
            {t("initialSync.startSync")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
