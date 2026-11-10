"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/ui/components/badge";

interface RoleTypeBadgeProps {
  isSystem: boolean;
}

export function RoleTypeBadge({ isSystem }: RoleTypeBadgeProps) {
  const t = useTranslations("roles.type");

  return (
    <Badge variant={isSystem ? "info" : "secondary"}>
      {isSystem ? t("system") : t("custom")}
    </Badge>
  );
}
