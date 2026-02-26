"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { BarChart2, Package, ShoppingCart, PackageX } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/components/tabs";
import { ReportCard } from "./report-card";
import type { ReportTypeValue } from "@/modules/reports/application/dto/report.dto";
import { REPORT_CATEGORIES } from "@/modules/reports/application/dto/report.dto";

const CATEGORY_ICONS = {
  inventory: Package,
  sales: ShoppingCart,
  returns: PackageX,
};

interface ReportInfo {
  type: ReportTypeValue;
  title: string;
  description: string;
  category: string;
}

const VALID_TABS = new Set(["inventory", "sales", "returns"]);

export function ReportCatalog() {
  const t = useTranslations("reports");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const initialTab =
    tabFromUrl && VALID_TABS.has(tabFromUrl) ? tabFromUrl : "inventory";
  const [activeTab, setActiveTab] = useState(initialTab);

  const getReportInfo = (
    type: ReportTypeValue,
    category: string,
  ): ReportInfo => ({
    type,
    title: t(`types.${type}`),
    description: t(`types.${type}_desc`),
    category,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <BarChart2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          {REPORT_CATEGORIES.map(({ key }) => {
            const Icon = CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS];
            return (
              <TabsTrigger key={key} value={key} className="gap-2 capitalize">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {t(`categories.${key}`)}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {REPORT_CATEGORIES.map(({ key, types }) => (
          <TabsContent key={key} value={key} className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {types.map((type) => {
                const info = getReportInfo(type, key);
                return (
                  <ReportCard
                    key={type}
                    type={info.type}
                    title={info.title}
                    description={info.description}
                    category={info.category}
                    locale={locale}
                  />
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
