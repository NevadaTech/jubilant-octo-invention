"use client";

import { Card, CardContent, CardHeader } from "@/ui/components/card";

export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-[250px] animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}
