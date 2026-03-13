import type { ContactFilters } from "@/modules/contacts/application/dto/contact.dto";

export const contactKeys = {
  all: ["contacts"] as const,
  lists: () => [...contactKeys.all, "list"] as const,
  list: (filters?: ContactFilters) =>
    [...contactKeys.lists(), filters] as const,
  details: () => [...contactKeys.all, "detail"] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
};
