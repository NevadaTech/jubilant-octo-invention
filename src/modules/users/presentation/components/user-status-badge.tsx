"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle, Lock } from "lucide-react";
import { Badge } from "@/ui/components/badge";
import type { UserStatus } from "@/modules/users/domain/entities/user.entity";

interface UserStatusBadgeProps {
  status: UserStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const t = useTranslations("users.status");

  const config: Record<
    UserStatus,
    {
      label: string;
      variant: "success" | "secondary" | "error";
      icon: typeof CheckCircle2;
    }
  > = {
    ACTIVE: { label: t("active"), variant: "success", icon: CheckCircle2 },
    INACTIVE: { label: t("inactive"), variant: "secondary", icon: XCircle },
    LOCKED: { label: t("locked"), variant: "error", icon: Lock },
  };

  const { label, variant, icon: Icon } = config[status];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
