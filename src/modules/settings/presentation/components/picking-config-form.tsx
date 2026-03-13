"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/ui/components/card";
import { Switch } from "@/ui/components/switch";
import { Skeleton } from "@/ui/components/skeleton";
import {
  usePickingConfig,
  type PickingMode,
} from "@/modules/sales/presentation/hooks/use-picking-config";

const MODES: { value: PickingMode; titleKey: string; descKey: string }[] = [
  { value: "OFF", titleKey: "off", descKey: "offDesc" },
  { value: "OPTIONAL", titleKey: "optional", descKey: "optionalDesc" },
  {
    value: "REQUIRED_FULL",
    titleKey: "requiredFull",
    descKey: "requiredFullDesc",
  },
  {
    value: "REQUIRED_PARTIAL",
    titleKey: "requiredPartial",
    descKey: "requiredPartialDesc",
  },
];

export function PickingConfigForm() {
  const t = useTranslations("settings.picking");
  const {
    config,
    setConfig,
    pickingEnabled,
    setPickingEnabled,
    isLoading,
    isSaving,
  } = usePickingConfig();

  return (
    <div className="space-y-6">
      {/* Toggle picking process */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          {isLoading ? (
            <div className="flex w-full items-center justify-between">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>
          ) : (
            <>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {t("enableTitle")}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {t("enableDescription")}
                </p>
              </div>
              <Switch
                checked={pickingEnabled}
                onCheckedChange={setPickingEnabled}
                disabled={isSaving}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Verification mode */}
      <Card className={!pickingEnabled ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map(
                (key) => (
                  <Skeleton key={key} className="h-16 w-full rounded-lg" />
                ),
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  disabled={isSaving || !pickingEnabled}
                  onClick={() => setConfig({ mode: mode.value })}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    config.mode === mode.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/50"
                  } ${isSaving || !pickingEnabled ? "cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-4 w-4 rounded-full border-2 ${
                        config.mode === mode.value
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {config.mode === mode.value && (
                        <div className="m-0.5 h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{t(mode.titleKey)}</p>
                      <p className="text-sm text-muted-foreground">
                        {t(mode.descKey)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
