"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/ui/components/badge";
import type { UserStatus } from "@/modules/users/domain/entities/user.entity";

interface UserStatusBadgeProps {
  status: UserStatus;
}

const variantByStatus = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  LOCKED: "error",
} as const;

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const t = useTranslations("users.status");

  const label = {
    ACTIVE: t("active"),
    INACTIVE: t("inactive"),
    LOCKED: t("locked"),
  }[status];

  return <Badge variant={variantByStatus[status]}>{label}</Badge>;
}
