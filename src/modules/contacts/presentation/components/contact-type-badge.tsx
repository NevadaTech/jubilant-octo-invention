"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/ui/lib/utils";
import type { ContactType } from "@/modules/contacts/domain/entities/contact.entity";

const tones: Record<ContactType, string> = {
  CUSTOMER: "bg-primary/10 text-primary",
  SUPPLIER:
    "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300",
  EMPLOYEE: "bg-muted text-muted-foreground",
};

interface ContactTypeBadgeProps {
  type: ContactType;
  className?: string;
}

export function ContactTypeBadge({ type, className }: ContactTypeBadgeProps) {
  const t = useTranslations("contacts");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        tones[type],
        className,
      )}
    >
      {t(`types.${type}`)}
    </span>
  );
}
