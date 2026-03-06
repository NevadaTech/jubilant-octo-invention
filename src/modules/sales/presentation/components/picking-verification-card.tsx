"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  PackageSearch,
  Camera,
  RotateCcw,
  Check,
  Minus,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import type { SaleLine } from "@/modules/sales/domain/entities/sale.entity";
import { usePickingConfig } from "../hooks/use-picking-config";
import { usePickingVerification } from "../hooks/use-picking-verification";
import { useBarcodeScanner } from "../hooks/use-barcode-scanner";
import { CameraScannerDialog } from "./camera-scanner-dialog";

interface PickingVerificationCardProps {
  lines: SaleLine[];
  saleId: string;
  onVerificationChange: (canShip: boolean) => void;
}

export function PickingVerificationCard({
  lines,
  saleId,
  onVerificationChange,
}: PickingVerificationCardProps) {
  const t = useTranslations("sales.picking");
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Notify parent about verification state
  useEffect(() => {
    onVerificationChange(canShipWithMode(config.mode));
  }, [canShipWithMode, config.mode, onVerificationChange]);

  const handleScan = useCallback(
    (barcode: string) => {
      processScan(barcode);
      setManualInput("");
      // Re-focus input after scan
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [processScan],
  );

  // Barcode scanner gun detection
  useBarcodeScanner({ enabled: true, onScan: handleScan });

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      handleScan(manualInput.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleManualSubmit();
    }
  };

  if (config.mode === "OFF") return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageSearch className="h-5 w-5" />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress bar */}
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("progress", {
                  verified: progress.verified,
                  total: progress.total,
                })}
              </span>
              <span className="font-medium">{progress.percentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progress.percentage === 100
                    ? "bg-green-500"
                    : progress.percentage > 0
                      ? "bg-yellow-500"
                      : "bg-muted-foreground/30"
                }`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Input row */}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              data-scan-input
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("inputPlaceholder")}
              className="flex-1"
              autoFocus
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCameraOpen(true)}
            >
              <Camera className="h-4 w-4" />
            </Button>
            <Button onClick={handleManualSubmit} disabled={!manualInput.trim()}>
              {t("verify")}
            </Button>
          </div>

          {/* Last scan feedback */}
          {lastScanResult && (
            <div
              className={`rounded-lg border px-3 py-2 text-sm ${
                lastScanResult.result === "SUCCESS"
                  ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                  : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
              }`}
            >
              {lastScanResult.result === "SUCCESS" && (
                <span className="mr-1">&#10003;</span>
              )}
              {lastScanResult.result !== "SUCCESS" && (
                <span className="mr-1">&#10007;</span>
              )}
              {lastScanResult.message}
            </div>
          )}

          {/* Verification table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-3">#</th>
                  <th className="pb-2 pr-3">{t("product")}</th>
                  <th className="pb-2 pr-3">{t("sku")}</th>
                  <th className="pb-2 pr-3 text-center">{t("need")}</th>
                  <th className="pb-2 pr-3 text-center">{t("scanned")}</th>
                  <th className="pb-2 text-center">{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {verificationLines.map((vl, idx) => {
                  const isComplete = vl.scannedCount >= vl.requiredQty;
                  const isPartial = vl.scannedCount > 0 && !isComplete;
                  return (
                    <tr
                      key={vl.lineId}
                      className={`border-b transition-colors ${
                        isComplete ? "bg-green-50/50 dark:bg-green-950/20" : ""
                      }`}
                    >
                      <td className="py-2 pr-3 text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="py-2 pr-3 font-medium">
                        {vl.productName}
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs">
                        {vl.productSku}
                      </td>
                      <td className="py-2 pr-3 text-center">
                        {vl.requiredQty}
                      </td>
                      <td className="py-2 pr-3 text-center">
                        {vl.scannedCount}/{vl.requiredQty}
                      </td>
                      <td className="py-2 text-center">
                        {isComplete && (
                          <Check className="mx-auto h-4 w-4 text-green-600" />
                        )}
                        {isPartial && (
                          <AlertTriangle className="mx-auto h-4 w-4 text-yellow-500" />
                        )}
                        {!isComplete && !isPartial && (
                          <Minus className="mx-auto h-4 w-4 text-muted-foreground" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Reset */}
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={resetAll}>
              <RotateCcw className="mr-2 h-3 w-3" />
              {t("resetAll")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <CameraScannerDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onScan={handleScan}
      />
    </>
  );
}
