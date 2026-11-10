"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import type { SaleLine } from "@/modules/sales/domain/entities/sale.entity";
import { usePickingConfig } from "@/modules/sales/presentation/hooks/use-picking-config";
import { usePickingVerification } from "@/modules/sales/presentation/hooks/use-picking-verification";
import { useBarcodeScanner } from "@/shared/presentation/hooks/use-barcode-scanner";
import { CameraScannerDialog } from "@/shared/presentation/components/camera-scanner-dialog";
import { PickingLinePhoto } from "./picking-line-photo";

interface PickingVerificationCardProps {
  lines: SaleLine[];
  saleId: string;
  saleNumber?: string;
  onVerificationChange: (canShip: boolean) => void;
}

export function PickingVerificationCard({
  lines,
  saleId: _saleId,
  saleNumber,
  onVerificationChange,
}: PickingVerificationCardProps) {
  const t = useTranslations("sales.picking");
  const tSales = useTranslations("sales");
  const tPhoto = useTranslations("inventory.products.photo");
  const { config } = usePickingConfig();
  const {
    verificationLines,
    processScan,
    progress,
    canShipWithMode,
    resetAll,
    lastScanResult,
  } = usePickingVerification(lines);

  const [manualInput, setManualInput] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousScanRef = useRef(lastScanResult);

  useEffect(() => {
    onVerificationChange(canShipWithMode(config.mode));
  }, [canShipWithMode, config.mode, onVerificationChange]);

  useEffect(() => {
    if (
      lastScanResult &&
      lastScanResult !== previousScanRef.current &&
      lastScanResult.result === "SUCCESS"
    ) {
      const match = verificationLines.find((line) =>
        lastScanResult.message.startsWith(line.productName),
      );
      if (match) setFocusId(match.lineId);
    }
    previousScanRef.current = lastScanResult;
  }, [lastScanResult, verificationLines]);

  const handleScan = useCallback(
    (barcode: string) => {
      processScan(barcode);
      setManualInput("");
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [processScan],
  );

  useBarcodeScanner({ enabled: true, onScan: handleScan });

  const handleManualSubmit = () => {
    if (manualInput.trim()) handleScan(manualInput.trim());
  };

  if (config.mode === "OFF") return null;

  const focus =
    verificationLines.find((line) => line.lineId === focusId) ??
    verificationLines.find((line) => line.scannedCount < line.requiredQty) ??
    verificationLines[0];

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-[22px] font-semibold text-foreground lg:text-[26px]">
          {saleNumber
            ? `${tSales("timeline.picking")} ${saleNumber}`
            : t("title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("progress", {
            verified: progress.verified,
            total: progress.total,
          })}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={
                progress.percentage >= 100
                  ? "h-full rounded-full bg-green-500"
                  : progress.percentage > 0
                    ? "h-full rounded-full bg-yellow-500"
                    : "h-full rounded-full bg-muted-foreground"
              }
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <span className="text-sm font-semibold tabular-nums">
            {progress.percentage}%
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          ref={inputRef}
          data-scan-input
          value={manualInput}
          onChange={(event) => setManualInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleManualSubmit();
            }
          }}
          placeholder={t("inputPlaceholder")}
          className="h-11 flex-1 rounded-lg"
          autoFocus
        />
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-lg"
          onClick={() => setCameraOpen(true)}
        >
          {t("scan")}
        </Button>
        <Button
          type="button"
          className="h-11 rounded-lg"
          onClick={handleManualSubmit}
          disabled={!manualInput.trim()}
        >
          {t("verify")}
        </Button>
      </div>

      {lastScanResult ? (
        <p
          className={
            lastScanResult.result === "SUCCESS"
              ? "rounded-lg border border-green-200 bg-success-100 px-3 py-3 text-sm font-semibold text-success-800 dark:bg-success-900/30 dark:text-success-300"
              : "rounded-lg border border-red-200 bg-error-100 px-3 py-3 text-sm text-error-800 dark:bg-error-900/30 dark:text-error-300"
          }
        >
          {lastScanResult.message}
        </p>
      ) : null}

      <div className="grid grid-cols-5 gap-2 px-1 text-xs font-semibold text-muted-foreground">
        <span>{t("product")}</span>
        <span>{t("sku")}</span>
        <span>{t("need")}</span>
        <span>{t("scanned")}</span>
        <span>{t("status")}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ul className="order-2 flex flex-col gap-2 lg:order-1">
          {verificationLines.map((line) => {
            const done = line.scannedCount >= line.requiredQty;
            const partial = !done && line.scannedCount > 0;
            return (
              <li key={line.lineId}>
                <button
                  type="button"
                  onClick={() => setFocusId(line.lineId)}
                  className={
                    done
                      ? "flex w-full items-center gap-3 rounded-xl border border-border bg-green-50 p-3 text-left"
                      : "flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left"
                  }
                >
                  {line.productId ? (
                    <PickingLinePhoto
                      productId={line.productId}
                      productName={line.productName}
                      size="thumb"
                    />
                  ) : null}
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold text-foreground">
                      {line.productName}
                    </span>
                    <span className="block font-mono text-[13px] text-muted-foreground">
                      {line.productSku}
                    </span>
                    <span className="block text-[13px] font-semibold tabular-nums text-foreground">
                      {line.scannedCount}/{line.requiredQty}
                    </span>
                    <span
                      className={
                        done
                          ? "mt-1 inline-flex rounded-full bg-success-100 px-2 py-0.5 text-xs font-semibold text-success-800 dark:bg-success-900/30 dark:text-success-300"
                          : partial
                            ? "mt-1 inline-flex rounded-full bg-warning-100 px-2 py-0.5 text-xs font-semibold text-warning-800 dark:bg-warning-900/30 dark:text-warning-300"
                            : "mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground"
                      }
                    >
                      {done ? t("verified") : partial ? t("pending") : "—"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {focus?.productId ? (
          <aside className="order-1 flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 lg:order-2">
            <p className="text-[13px] font-semibold text-muted-foreground">
              {tPhoto("title")}
            </p>
            <PickingLinePhoto
              productId={focus.productId}
              productName={focus.productName}
              size="reference"
            />
            <p className="text-base font-semibold text-foreground">
              {focus.productName}
            </p>
            <p className="text-[13px] text-muted-foreground">{t("photoNote")}</p>
          </aside>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={resetAll}>
          <RotateCcw className="mr-2 h-3 w-3" />
          {t("resetAll")}
        </Button>
      </div>

      <CameraScannerDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onScan={handleScan}
      />
    </section>
  );
}
