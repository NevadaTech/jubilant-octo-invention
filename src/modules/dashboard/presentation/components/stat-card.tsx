"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/card";
import { cn } from "@/ui/lib/utils";

export type StatCardColor = "primary" | "success" | "warning" | "error";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color?: StatCardColor;
}

const colorStyles: Record<StatCardColor, { bg: string; text: string }> = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
  },
  success: {
    bg: "bg-success/10",
    text: "text-success",
  },
  warning: {
    bg: "bg-warning/10",
    text: "text-warning",
  },
  error: {
    bg: "bg-destructive/10",
    text: "text-destructive",
  },
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color = "primary",
}: StatCardProps) {
  const styles = colorStyles[color];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("rounded-full p-2", styles.bg)}>
          <Icon className={cn("h-4 w-4", styles.text)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold truncate">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
