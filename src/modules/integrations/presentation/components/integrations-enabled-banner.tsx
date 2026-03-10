"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { useOrgSettings } from "@/shared/presentation/hooks/use-org-settings";

export function IntegrationsEnabledBanner() {
  const t = useTranslations("integrations.enabledBanner");
  const { integrationsEnabled } = useOrgSettings();

  return (
    <div
      className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
        integrationsEnabled
          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
          : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
      }`}
    >
      <div className="flex items-center gap-2">
        {integrationsEnabled ? (
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        )}
        <span
          className={`text-sm font-medium ${
            integrationsEnabled
              ? "text-green-700 dark:text-green-300"
              : "text-amber-700 dark:text-amber-300"
          }`}
        >
          {integrationsEnabled ? t("enabled") : t("disabled")}
        </span>
      </div>
      <Link
        href="/dashboard/settings"
        className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
      >
        {t("goToSettings")}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
