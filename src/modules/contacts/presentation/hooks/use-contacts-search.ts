"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getContainer } from "@/config/di/container";
import type { ContactFilters } from "@/modules/contacts/application/dto/contact.dto";
import type {
  Contact,
  ContactType,
} from "@/modules/contacts/domain/entities/contact.entity";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300;

export interface UseContactsSearchOptions {
  search?: string;
  isActive?: boolean;
  type?: ContactType;
  enabled?: boolean;
}

export interface ContactsSearchPage {
  data: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Hook que implementa lazy loading + búsqueda de contactos al backend con debounce.
 * Usa useInfiniteQuery para soportar "cargar más" vía intersection observer.
 * Busca por nombre o identificación.
 */
export function useContactsSearch(options: UseContactsSearchOptions = {}) {
  const { search, isActive, type, enabled = true } = options;

  // Debounce del término de búsqueda
  const [debouncedSearch, setDebouncedSearch] = useState(search ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(search ?? "");
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [search]);

  const filters: ContactFilters = {
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(isActive !== undefined && { isActive }),
    ...(type && { type }),
    limit: PAGE_SIZE,
  };

  const query = useInfiniteQuery({
    queryKey: ["contacts", "infinite", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getContainer().contactRepository.findAll({
        ...filters,
        page: pageParam as number,
      });
      return result as ContactsSearchPage;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 min — datos de selector no necesitan ser muy frescos
    enabled,
  });

  // Aplanar todas las páginas en una lista de contactos
  const contacts = query.data?.pages.flatMap((p) => p.data) ?? [];

  return {
    contacts,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isError: query.isError,
  };
}
