"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { FormField } from "@/ui/components/form-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/dialog";
import { useReceiveTransfer } from "@/modules/inventory/presentation/hooks/use-transfers";
import type { Transfer } from "@/modules/inventory/domain/entities/transfer.entity";

interface TransferReceiveModalProps {
  transfer: Transfer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferReceiveModal({
  transfer,
  open,
  onOpenChange,
}: TransferReceiveModalProps) {
  const t = useTranslations("inventory.transfers");
  const tCommon = useTranslations("common");
  const receiveTransfer = useReceiveTransfer();

  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(transfer.lines.map((line) => [line.id, line.quantity])),
  );

  const handleQuantityChange = (lineId: string, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setQuantities((prev) => ({ ...prev, [lineId]: num }));
    }
  };

  const handleConfirm = async () => {
    await receiveTransfer.mutateAsync({
      id: transfer.id,
      data: {
        lines: transfer.lines.map((line) => ({
          lineId: line.id,
          receivedQuantity: quantities[line.id] ?? line.quantity,
        })),
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("receive.title")}</DialogTitle>
          <DialogDescription>
            {transfer.fromWarehouseName} → {transfer.toWarehouseName}.{" "}
            {t("receive.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-3 text-[13px] font-semibold sm:grid-cols-[minmax(0,1fr)_140px_160px]">
            <span>{t("fields.product")}</span>
            <span>{t("fields.quantity")}</span>
            <span>{t("fields.receivedQuantity")}</span>
          </div>
          {transfer.lines.map((line) => (
            <div
              key={line.id}
              className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px_160px]"
            >
              <div className="flex min-w-0 flex-col justify-center gap-0.5">
                <p className="text-sm font-semibold text-foreground">
                  {line.productName}
                </p>
                <p className="font-mono text-sm text-muted-foreground">
                  {line.productSku}
                </p>
              </div>
              <Input className="h-10" value={line.quantity} readOnly />
              <FormField>
                <Input
                  id={`received-${line.id}`}
                  type="number"
                  min="0"
                  max={line.quantity}
                  className="h-10"
                  aria-label={t("fields.receivedQuantity")}
                  value={quantities[line.id] ?? line.quantity}
                  onChange={(e) => handleQuantityChange(line.id, e.target.value)}
                />
              </FormField>
            </div>
          ))}
          <p className="rounded-lg bg-warning-100 px-3 py-2 text-sm text-warning-800 dark:bg-warning-900/30 dark:text-warning-300">
            {t("receive.description")}
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={receiveTransfer.isPending}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={receiveTransfer.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {receiveTransfer.isPending
              ? tCommon("loading")
              : t("actions.receive")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
