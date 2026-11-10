export function StatCardSkeleton() {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-6 shadow-none">
      <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
      <div className="sr-only h-8 w-8 animate-pulse rounded-full bg-muted" />
      <div className="h-7 w-20 animate-pulse rounded-md bg-muted" />
      <div className="h-3 w-32 animate-pulse rounded-md bg-muted" />
    </div>
  );
}
