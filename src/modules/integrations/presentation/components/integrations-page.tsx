"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/components/tabs";
import { ProviderTabContent } from "./provider-tab-content";

export function IntegrationsPage() {
  const t = useTranslations("integrations");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          {t("title")}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {t("description")}
        </p>
      </div>

      <Tabs defaultValue="vtex">
        <TabsList>
          <TabsTrigger value="vtex">{t("providers.vtex.name")}</TabsTrigger>
          <TabsTrigger value="mercadolibre">
            {t("providers.mercadolibre.name")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vtex">
          <ProviderTabContent provider="VTEX" />
        </TabsContent>

        <TabsContent value="mercadolibre">
          <ProviderTabContent provider="MERCADOLIBRE" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
