"use client";

import { Badge } from "@/ui/components/badge";

const METHOD_VARIANTS: Record<
  string,
  "default" | "success" | "destructive" | "warning" | "info" | "secondary"
> = {
  GET: "secondary",
  POST: "success",
  PUT: "info",
  PATCH: "warning",
  DELETE: "destructive",
};

export function AuditMethodBadge({ method }: { method: string | null }) {
  if (!method) return <span className="text-muted-foreground">-</span>;
  const variant = METHOD_VARIANTS[method] ?? "secondary";
  return (
    <Badge variant={variant} className="font-mono text-xs">
      {method}
    </Badge>
  );
}
