"use client";

import { useAuth } from "@/modules/authentication/presentation/hooks/use-auth";

export function useOrgSettings() {
  const { user } = useAuth();

  const multiCompanyEnabled = user?.orgSettings?.multiCompanyEnabled ?? false;

  return {
    multiCompanyEnabled,
  };
}
