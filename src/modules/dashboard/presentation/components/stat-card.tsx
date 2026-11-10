"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/ui/lib/utils";

export type StatCardColor = "primary" | "success" | "warning" | "error";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color?: StatCardColor;
  shortTitle?: string;
  className?: string;
}

const valueTone: Record<StatCardColor, string> = {
  primary: "text-foreground",
  success: "text-foreground",
  warning: "text-warning",
  error: "text-warning",
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color = "primary",
  shortTitle,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col gap-1 rounded-lg border border-border bg-card p-6 shadow-none",
        className,
      )}
    >
      <Icon aria-hidden className="sr-only" />
      {shortTitle ? (
        <>
          <p className="text-[13px] text-muted-foreground lg:hidden">
            {shortTitle}
          </p>
          <p className="hidden text-[13px] text-muted-foreground lg:block">
            {title}
          </p>
        </>
      ) : (
        <p className="text-[13px] text-muted-foreground">{title}</p>
      )}
      <p
        className={cn(
          "text-xl font-bold leading-tight tabular-nums lg:text-[26px]",
          valueTone[color],
        )}
      >
        {value}
      </p>
      {description ? (
        <p className="hidden text-[13px] text-muted-foreground lg:block">
          {description}
        </p>
      ) : null}
    </div>
  );
}
