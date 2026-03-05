"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";
import { useOrgSettings } from "@/shared/presentation/hooks/use-org-settings";

export function MultiCompanyToggle() {
  const t = useTranslations("settings");
  const { multiCompanyEnabled } = useOrgSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("multiCompany.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t("multiCompany.description")}
        </p>
        <div className="flex items-center gap-3">
          <Badge variant={multiCompanyEnabled ? "success" : "secondary"}>
            {multiCompanyEnabled
              ? t("multiCompany.enabled")
              : t("multiCompany.disabled")}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
