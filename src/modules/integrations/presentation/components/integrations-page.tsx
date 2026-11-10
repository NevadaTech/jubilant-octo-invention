"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/components/tabs";
import { PageHeader } from "@/ui/layout/page-header";
import { ProviderTabContent } from "./provider-tab-content";

export function IntegrationsPage() {
  const t = useTranslations("integrations");

  return (
    <div className="space-y-4">
      <PageHeader title={t("title")} description={t("description")} />

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
