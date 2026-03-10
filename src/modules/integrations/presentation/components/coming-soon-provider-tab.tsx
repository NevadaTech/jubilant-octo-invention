"use client";

import { useTranslations } from "next-intl";
import { Construction } from "lucide-react";
import { Card, CardContent } from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";

interface ComingSoonProviderTabProps {
  providerKey: string;
}

export function ComingSoonProviderTab({
  providerKey,
}: ComingSoonProviderTabProps) {
  const t = useTranslations("integrations.providers");

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Construction className="h-12 w-12 text-muted-foreground/50" />
        <Badge variant="secondary" className="mt-4">
          {t(`${providerKey}.comingSoon` as never)}
        </Badge>
        <h3 className="mt-3 text-lg font-semibold">
          {t(`${providerKey}.name` as never)}
        </h3>
        <p className="mt-1 max-w-md text-center text-sm text-muted-foreground">
          {t(`${providerKey}.comingSoonDescription` as never)}
        </p>
      </CardContent>
    </Card>
  );
}
