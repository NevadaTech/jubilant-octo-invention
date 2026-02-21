"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/dialog";
import { useReceiveTransfer } from "../../hooks/use-transfers";
import type { Transfer } from "../../../domain/entities/transfer.entity";

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
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {t("receive.title")}
          </DialogTitle>
          <DialogDescription>{t("receive.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3 text-sm font-medium text-muted-foreground border-b pb-2">
            <span className="col-span-1">{t("fields.product")}</span>
            <span className="text-right">{t("fields.quantity")}</span>
            <span className="text-right">{t("fields.receivedQuantity")}</span>
          </div>

          {transfer.lines.map((line) => (
            <div key={line.id} className="grid grid-cols-3 gap-3 items-center">
              <div className="col-span-1">
                <p className="text-sm font-medium leading-tight">
                  {line.productName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {line.productSku}
                </p>
              </div>
              <p className="text-right text-sm font-medium">{line.quantity}</p>
              <Input
                type="number"
                min="0"
                max={line.quantity}
                value={quantities[line.id] ?? line.quantity}
                onChange={(e) => handleQuantityChange(line.id, e.target.value)}
                className="text-right h-8"
              />
            </div>
          ))}
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
