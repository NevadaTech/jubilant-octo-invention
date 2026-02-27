"use client";

import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@/shared/domain/permissions";
import { PermissionGate } from "@/shared/presentation/components/permission-gate";
import { ProfileForm } from "./profile-form";
import { AlertConfigurationForm } from "./alert-configuration-form";

export function SettingsPage() {
  const t = useTranslations("settings");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          {t("title")}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {t("description")}
        </p>
      </div>

      <ProfileForm />

      <PermissionGate permission={PERMISSIONS.SETTINGS_MANAGE}>
        <AlertConfigurationForm />
      </PermissionGate>
    </div>
  );
}
