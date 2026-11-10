"use client";

import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@/shared/domain/permissions";
import { PermissionGate } from "@/shared/presentation/components/permission-gate";
import { PageHeader } from "@/ui/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/components/tabs";
import { ProfileForm } from "./profile-form";
import { ChangePasswordForm } from "./change-password-form";
import { AlertConfigurationForm } from "./alert-configuration-form";
import { MultiCompanyToggle } from "./multi-company-toggle";
import { IntegrationsToggle } from "./integrations-toggle";
import { PickingConfigForm } from "./picking-config-form";
import { CompanyList } from "@/modules/companies/presentation/components";
import { useOrgSettings } from "@/shared/presentation/hooks/use-org-settings";

const tabClassName =
  "!h-auto !rounded-lg !border !border-border !bg-card !px-3 !py-2 !font-normal !text-foreground !shadow-none data-[state=active]:!border-primary data-[state=active]:!bg-accent data-[state=active]:!font-semibold data-[state=active]:!text-primary";

export function SettingsPage() {
  const t = useTranslations("settings");
  const { multiCompanyEnabled, integrationsEnabled } = useOrgSettings();

  return (
    <div className="space-y-4">
      <PageHeader title={t("title")} description={t("description")} />

      <Tabs defaultValue="account">
        <TabsList className="!h-auto !w-full !flex-wrap !justify-start !gap-2 !bg-transparent !p-0">
          <TabsTrigger value="account" className={tabClassName}>
            {t("tabs.account")}
          </TabsTrigger>
          <TabsTrigger value="notifications" className={tabClassName}>
            {t("tabs.notifications")}
          </TabsTrigger>
          <TabsTrigger value="picking" className={tabClassName}>
            {t("tabs.picking")}
          </TabsTrigger>
          <TabsTrigger value="organization" className={tabClassName}>
            {t("tabs.organization")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-4 max-w-[560px] space-y-4">
          <ProfileForm />
          <ChangePasswordForm />
        </TabsContent>

        <TabsContent
          value="notifications"
          className="mt-4 max-w-[560px] space-y-4"
        >
          <PermissionGate permission={PERMISSIONS.SETTINGS_MANAGE}>
            <AlertConfigurationForm />
          </PermissionGate>
        </TabsContent>

        <TabsContent value="picking" className="mt-4 max-w-[560px] space-y-4">
          <PermissionGate permission={PERMISSIONS.SETTINGS_MANAGE}>
            <PickingConfigForm />
          </PermissionGate>
        </TabsContent>

        <TabsContent value="organization" className="mt-4 space-y-4">
          {integrationsEnabled ? (
            <PermissionGate permission={PERMISSIONS.SETTINGS_MANAGE}>
              <IntegrationsToggle />
            </PermissionGate>
          ) : null}
          <PermissionGate permission={PERMISSIONS.SETTINGS_MANAGE}>
            <MultiCompanyToggle />
          </PermissionGate>
          {multiCompanyEnabled ? (
            <PermissionGate permission={PERMISSIONS.SETTINGS_MANAGE}>
              <CompanyList />
            </PermissionGate>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
