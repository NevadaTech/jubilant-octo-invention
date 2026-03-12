"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Camera, XCircle, Check, X } from "lucide-react";
import { Button } from "@/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/ui/components/dialog";
import { useCameraScanner } from "@/modules/sales/presentation/hooks/use-camera-scanner";

interface CameraScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
}

export function CameraScannerDialog({
  open,
  onOpenChange,
  onScan,
}: CameraScannerDialogProps) {
  const t = useTranslations("sales.picking");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const handleScan = useCallback(
    (barcode: string) => {
      setLastScanned(barcode);
      onScan(barcode);
    },
    [onScan],
  );

  // Clear feedback after 2 seconds
  useEffect(() => {
    if (!lastScanned) return;
    const timer = setTimeout(() => setLastScanned(null), 2000);
    return () => clearTimeout(timer);
  }, [lastScanned]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) setLastScanned(null);
  }, [open]);

  const { isActive, error, start, stop, backend } = useCameraScanner({
    enabled: open,
    videoRef,
    onScan: handleScan,
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      stop();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {t("cameraTitle")}
          </DialogTitle>
          <DialogDescription>{t("cameraDescription")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
            />
            {!isActive && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button onClick={start} variant="secondary">
                  <Camera className="mr-2 h-4 w-4" />
                  {t("startCamera")}
                </Button>
              </div>
            )}
            {lastScanned && (
              <div className="absolute inset-x-0 bottom-0 bg-green-600/90 px-3 py-2 text-center text-sm font-medium text-white">
                <Check className="mr-1 inline h-4 w-4" />
                {lastScanned}
              </div>
            )}
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <XCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          {isActive && backend && (
            <p className="text-xs text-muted-foreground text-center">
              {backend === "native" ? t("backendNative") : t("backendZxing")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
