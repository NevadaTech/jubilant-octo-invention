"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/ui/components/badge";
import type { ContactType } from "@/modules/contacts/domain/entities/contact.entity";

interface ContactTypeBadgeProps {
  type: ContactType;
}

export function ContactTypeBadge({ type }: ContactTypeBadgeProps) {
  const t = useTranslations("contacts");

  const variants: Record<ContactType, "info" | "warning"> = {
    CUSTOMER: "info",
    SUPPLIER: "warning",
  };

  return <Badge variant={variants[type]}>{t(`types.${type}`)}</Badge>;
}
