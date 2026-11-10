import type { ReactNode } from "react";
import { cn } from "@/ui/lib/utils";

export type CatalogTone = "success" | "warning" | "danger" | "muted";

const toneClass: Record<CatalogTone, string> = {
  success: "bg-success-100 text-success-700",
  warning: "bg-warning-100 text-warning-700",
  danger: "bg-error-100 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

export function CatalogStatus({
  tone,
  children,
}: {
  tone: CatalogTone;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        toneClass[tone],
      )}
    >
      {children}
    </span>
  );
}

export const catalogTextAction =
  "text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const catalogDangerAction =
  "text-sm font-semibold text-destructive underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const catalogFilterLabel = "text-xs font-semibold text-muted-foreground";

export const catalogPanel = "overflow-hidden rounded-xl border border-border bg-card";

export function CatalogEmpty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 px-6 py-10">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="max-w-lg text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
