"use client";

import { useTranslations } from "next-intl";
import {
  ShoppingCart,
  ArrowRightLeft,
  RotateCcw,
  PackageCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/ui/components/card";
import { Badge } from "@/ui/components/badge";

interface RecentActivityFeedProps {
  data: Array<{
    type: string;
    reference: string;
    status: string;
    description: string;
    createdAt: string;
  }>;
}

const typeIcons: Record<string, typeof ShoppingCart> = {
  SALE: ShoppingCart,
  MOVEMENT: PackageCheck,
  RETURN: RotateCcw,
  TRANSFER: ArrowRightLeft,
};

const statusVariant: Record<
  string,
  "default" | "success" | "warning" | "destructive" | "secondary" | "outline"
> = {
  DRAFT: "secondary",
  CONFIRMED: "default",
  COMPLETED: "success",
  SHIPPED: "default",
  PICKING: "warning",
  POSTED: "success",
  VOID: "destructive",
  IN_TRANSIT: "warning",
  RECEIVED: "success",
  CANCELLED: "destructive",
};

export function RecentActivityFeed({ data }: RecentActivityFeedProps) {
  const t = useTranslations("dashboard.charts");

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("recentActivity.justNow");
    if (diffMins < 60)
      return t("recentActivity.minutesAgo", { count: diffMins });
    if (diffHours < 24)
      return t("recentActivity.hoursAgo", { count: diffHours });
    return t("recentActivity.daysAgo", { count: diffDays });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("recentActivity.title")}</CardTitle>
        <CardDescription>{t("recentActivity.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            {t("noData")}
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item, idx) => {
              const Icon = typeIcons[item.type] || PackageCheck;
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-muted p-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {item.description}
                      </span>
                      <Badge
                        variant={statusVariant[item.status] || "outline"}
                        className="shrink-0 text-xs"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
