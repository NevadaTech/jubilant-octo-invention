export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
  permissions: () => [...roleKeys.all, "permissions"] as const,
};
