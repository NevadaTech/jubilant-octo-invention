"use client";

import { CheckCircle, XCircle, Minus } from "lucide-react";

export function AuditStatusIndicator({
  statusCode,
}: {
  statusCode: number | null;
}) {
  if (statusCode === null) {
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
  if (statusCode >= 200 && statusCode < 400) {
    return (
      <span className="flex items-center gap-1 text-emerald-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-xs">{statusCode}</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-destructive">
      <XCircle className="h-4 w-4" />
      <span className="text-xs">{statusCode}</span>
    </span>
  );
}
