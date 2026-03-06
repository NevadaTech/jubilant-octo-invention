"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/ui/components/card";
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
  const { config, setConfig } = usePickingConfig();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setConfig({ mode: mode.value })}
              className={`w-full rounded-lg border p-4 text-left transition-colors ${
                config.mode === mode.value
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/50"
              }`}
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
        <p className="mt-4 text-xs text-muted-foreground">{t("localNote")}</p>
      </CardContent>
    </Card>
  );
}
