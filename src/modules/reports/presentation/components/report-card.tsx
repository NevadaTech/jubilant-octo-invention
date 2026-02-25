"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Package,
  History,
  Calculator,
  AlertTriangle,
  ArrowUpDown,
  DollarSign,
  RotateCcw,
  ShoppingCart,
  BarChart3,
  Building2,
  PackageX,
  Layers,
  User,
  Truck,
  TrendingUp,
  Archive,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";
import { Button } from "@/ui/components/button";
import { cn } from "@/ui/lib/utils";
import type { ReportTypeValue } from "../../application/dto/report.dto";
import { reportTypeToSlug } from "../utils/report-utils";

interface ReportCardProps {
  type: ReportTypeValue;
  title: string;
  description: string;
  category: string;
  locale: string;
}

const REPORT_ICONS: Record<ReportTypeValue, React.ElementType> = {
  AVAILABLE_INVENTORY: Package,
  MOVEMENT_HISTORY: History,
  VALUATION: Calculator,
  LOW_STOCK: AlertTriangle,
  MOVEMENTS: ArrowUpDown,
  FINANCIAL: DollarSign,
  TURNOVER: RotateCcw,
  SALES: ShoppingCart,
  SALES_BY_PRODUCT: BarChart3,
  SALES_BY_WAREHOUSE: Building2,
  RETURNS: PackageX,
  RETURNS_BY_TYPE: Layers,
  RETURNS_BY_PRODUCT: BarChart3,
  RETURNS_CUSTOMER: User,
  RETURNS_SUPPLIER: Truck,
  ABC_ANALYSIS: TrendingUp,
  DEAD_STOCK: Archive,
};

const CATEGORY_COLORS: Record<string, string> = {
  inventory:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  sales:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  returns:
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
};

const ICON_COLORS: Record<string, string> = {
  inventory: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
  sales:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400",
  returns:
    "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
};

const ALERT_TYPES: ReportTypeValue[] = ["LOW_STOCK"];

export function ReportCard({
  type,
  title,
  description,
  category,
  locale,
}: ReportCardProps) {
  const t = useTranslations("reports");
  const Icon = REPORT_ICONS[type];
  const slug = reportTypeToSlug(type);
  const isAlert = ALERT_TYPES.includes(type);

  return (
    <Card
      className={cn(
        "group flex flex-col transition-all duration-200 hover:shadow-md",
        isAlert && "border-orange-200 dark:border-orange-800",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              ICON_COLORS[category],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 text-xs capitalize",
              CATEGORY_COLORS[category],
            )}
          >
            {t(`categories.${category}`)}
          </Badge>
        </div>
        <CardTitle className="mt-2 text-base leading-tight">{title}</CardTitle>
        <CardDescription className="text-xs leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto pt-0">
        <Button asChild className="w-full gap-2" size="sm" variant="outline">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link href={`/${locale}/dashboard/reports/${slug}` as any}>
            {t("viewReport")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
