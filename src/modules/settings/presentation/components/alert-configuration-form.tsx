"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/ui/components/button";
import { Label } from "@/ui/components/label";
import { Textarea } from "@/ui/components/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/ui/components/card";
import { FormField } from "@/ui/components/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { Switch } from "@/ui/components/switch";
import { Skeleton } from "@/ui/components/skeleton";
import { useAlertConfiguration, useUpdateAlertConfiguration } from "@/modules/settings/presentation/hooks";
import {
  alertConfigurationSchema,
  type AlertConfigurationFormValues,
} from "@/modules/settings/presentation/schemas";

const FREQUENCY_OPTIONS = [
  { value: "EVERY_HOUR", labelKey: "everyHour" },
  { value: "EVERY_6_HOURS", labelKey: "every6Hours" },
  { value: "EVERY_12_HOURS", labelKey: "every12Hours" },
  { value: "EVERY_DAY", labelKey: "everyDay" },
  { value: "EVERY_WEEK", labelKey: "everyWeek" },
  { value: "EVERY_2_WEEKS", labelKey: "every2Weeks" },
  { value: "EVERY_MONTH", labelKey: "everyMonth" },
] as const;

export function AlertConfigurationForm() {
  const t = useTranslations("settings.alerts");
  const { data: config, isLoading } = useAlertConfiguration();
  const updateConfig = useUpdateAlertConfiguration();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<AlertConfigurationFormValues>({
    resolver: zodResolver(alertConfigurationSchema),
    defaultValues: {
      isEnabled: true,
      cronFrequency: "EVERY_HOUR",
      notifyLowStock: true,
      notifyCriticalStock: true,
      notifyOutOfStock: true,
      recipientEmails: "",
    },
  });

  const isEnabled = watch("isEnabled");
  const cronFrequency = watch("cronFrequency");

  useEffect(() => {
    if (config) {
      reset({
        isEnabled: config.isEnabled,
        cronFrequency:
          config.cronFrequency as AlertConfigurationFormValues["cronFrequency"],
        notifyLowStock: config.notifyLowStock,
        notifyCriticalStock: config.notifyCriticalStock,
        notifyOutOfStock: config.notifyOutOfStock,
        recipientEmails: config.recipientEmails ?? "",
      });
    }
  }, [config, reset]);

  const onSubmit = (data: AlertConfigurationFormValues) => {
    updateConfig.mutate({
      isEnabled: data.isEnabled,
      cronFrequency: data.cronFrequency,
      notifyLowStock: data.notifyLowStock,
      notifyCriticalStock: data.notifyCriticalStock,
      notifyOutOfStock: data.notifyOutOfStock,
      recipientEmails: data.recipientEmails || "",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            // eslint-disable-next-line @eslint-react/no-array-index-key
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isEnabled">{t("enabled")}</Label>
            <Controller
              name="isEnabled"
              control={control}
              render={({ field }) => (
                <Switch
                  id="isEnabled"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <div
            className={
              !isEnabled ? "pointer-events-none opacity-50" : undefined
            }
          >
            {/* Frequency */}
            <div className="space-y-4">
              <FormField error={errors.cronFrequency?.message}>
                <Label>{t("frequency")}</Label>
                <Select
                  value={cronFrequency}
                  onValueChange={(val) =>
                    setValue(
                      "cronFrequency",
                      val as AlertConfigurationFormValues["cronFrequency"],
                      { shouldDirty: true },
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("frequency")} />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {t(opt.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              {/* Severity toggles */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">{t("severities")}</Label>

                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="notifyLowStock" className="font-normal">
                      {t("lowStock")}
                    </Label>
                    <Controller
                      name="notifyLowStock"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          id="notifyLowStock"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label
                      htmlFor="notifyCriticalStock"
                      className="font-normal"
                    >
                      {t("criticalStock")}
                    </Label>
                    <Controller
                      name="notifyCriticalStock"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          id="notifyCriticalStock"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="notifyOutOfStock" className="font-normal">
                      {t("outOfStock")}
                    </Label>
                    <Controller
                      name="notifyOutOfStock"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          id="notifyOutOfStock"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Recipient emails */}
              <FormField error={errors.recipientEmails?.message}>
                <Label htmlFor="recipientEmails">{t("recipients")}</Label>
                <Controller
                  name="recipientEmails"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="recipientEmails"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="admin@company.com, manager@company.com"
                      rows={3}
                    />
                  )}
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {t("recipientsHelp")}
                </p>
              </FormField>
            </div>
          </div>

          {/* Last run info */}
          {config?.lastRunAt && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t("lastRun")}: {new Date(config.lastRunAt).toLocaleString()}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={!isDirty || updateConfig.isPending}>
              {updateConfig.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("save")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
