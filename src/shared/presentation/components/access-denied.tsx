"use client";

import { ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/ui/components/button";
import { Card, CardContent } from "@/ui/components/card";

export function AccessDenied() {
  const t = useTranslations("common");

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <ShieldAlert className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="mt-6 text-xl font-semibold">{t("accessDenied")}</h2>
        <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
          {t("accessDeniedDescription")}
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/dashboard">{t("backToDashboard")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
