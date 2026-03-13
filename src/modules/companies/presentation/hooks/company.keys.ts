import type { CompanyFilters } from "@/modules/companies/application/dto/company.dto";

export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (filters?: CompanyFilters) =>
    [...companyKeys.lists(), filters] as const,
  details: () => [...companyKeys.all, "detail"] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
};
