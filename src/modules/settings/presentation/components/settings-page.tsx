"use client";

import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@/shared/domain/permissions";
import { PermissionGate } from "@/shared/presentation/components/permission-gate";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/components/tabs";
import { ProfileForm } from "./profile-form";
import { ChangePasswordForm } from "./change-password-form";
import { AlertConfigurationForm } from "./alert-configuration-form";
import { MultiCompanyToggle } from "./multi-company-toggle";
import { useOrgSettings } from "@/shared/presentation/hooks/use-org-settings";

export function SettingsPage() {
  const t = useTranslations("settings");
  const { multiCompanyEnabled } = useOrgSettings();

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

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">{t("tabs.account")}</TabsTrigger>
          <TabsTrigger value="notifications">
            {t("tabs.notifications")}
          </TabsTrigger>
          {multiCompanyEnabled && (
            <TabsTrigger value="organization">
              {t("tabs.organization")}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="account" className="space-y-6 mt-6">
          <ProfileForm />
          <ChangePasswordForm />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-6">
          <PermissionGate permission={PERMISSIONS.SETTINGS_MANAGE}>
            <AlertConfigurationForm />
          </PermissionGate>
        </TabsContent>

        {multiCompanyEnabled && (
          <TabsContent value="organization" className="space-y-6 mt-6">
            <PermissionGate permission={PERMISSIONS.SETTINGS_MANAGE}>
              <MultiCompanyToggle />
            </PermissionGate>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
