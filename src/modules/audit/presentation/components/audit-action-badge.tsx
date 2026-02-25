"use client";

import { Badge } from "@/ui/components/badge";

const ACTION_VARIANTS: Record<
  string,
  "default" | "success" | "destructive" | "warning" | "info" | "secondary"
> = {
  CREATE: "success",
  UPDATE: "info",
  DELETE: "destructive",
  LOGIN: "default",
  LOGOUT: "secondary",
  STATUS_CHANGE: "warning",
  EXPORT: "secondary",
  ASSIGN: "info",
  REMOVE: "warning",
};

export function AuditActionBadge({ action }: { action: string }) {
  const variant = ACTION_VARIANTS[action] ?? "secondary";
  return <Badge variant={variant}>{action}</Badge>;
}
