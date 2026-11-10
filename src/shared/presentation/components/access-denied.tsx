"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/ui/components/button";
import { usePermissions } from "@/modules/authentication/presentation/hooks/use-permissions";

export function AccessDenied() {
  const t = useTranslations("common");
  const tRoles = useTranslations("roles");
  const { roles = [] } = usePermissions();
  const role = roles[0];
  const roleLabel = role
    ? tRoles.has(`names.${role}`)
      ? tRoles(`names.${role}`)
      : role
    : t("accessDeniedUnknownRole");

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-[560px] space-y-2 rounded-xl bg-error-100 p-5">
        <h1 className="text-[22px] font-semibold leading-tight text-foreground">
          {t("accessDenied")}
        </h1>
        <p className="text-[15px] leading-snug text-foreground">
          {t("accessDeniedDescription", { role: roleLabel })}
        </p>
        <Button asChild className="mt-2">
          <Link href="/dashboard">{t("backToDashboard")}</Link>
        </Button>
      </div>
    </div>
  );
}
