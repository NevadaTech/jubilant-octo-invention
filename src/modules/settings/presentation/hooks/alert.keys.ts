export const alertKeys = {
  all: ["alert-configuration"] as const,
  config: () => [...alertKeys.all, "config"] as const,
};
