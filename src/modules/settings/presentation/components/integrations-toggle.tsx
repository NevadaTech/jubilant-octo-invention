"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";
import { useOrgSettings } from "@/shared/presentation/hooks/use-org-settings";

export function IntegrationsToggle() {
  const t = useTranslations("settings");
  const { integrationsEnabled } = useOrgSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("integrations.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t("integrations.description")}
        </p>
        <div className="flex items-center gap-3">
          <Badge variant={integrationsEnabled ? "success" : "secondary"}>
            {integrationsEnabled
              ? t("integrations.enabled")
              : t("integrations.disabled")}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
