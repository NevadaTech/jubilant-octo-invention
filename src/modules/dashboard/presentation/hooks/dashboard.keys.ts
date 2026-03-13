export const dashboardKeys = {
  all: ["dashboard"] as const,
  metrics: (companyId?: string | null) =>
    [...dashboardKeys.all, "metrics", companyId ?? "all"] as const,
};
