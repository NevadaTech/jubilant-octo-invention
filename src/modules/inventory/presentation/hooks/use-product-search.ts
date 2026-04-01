"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getContainer } from "@/config/di/container";
import type { ProductFilters } from "@/modules/inventory/application/dto";
import type { Product } from "@/modules/inventory/domain/entities/product.entity";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300;

export interface UseProductSearchOptions {
  search?: string;
  companyId?: string;
  statuses?: string[];
  enabled?: boolean;
}

export interface ProductSearchPage {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Hook que implementa lazy loading + búsqueda al backend con debounce.
 * Usa useInfiniteQuery para soportar "cargar más" vía intersection observer.
 */
export function useProductSearch(options: UseProductSearchOptions = {}) {
  const { search, companyId, statuses = ["ACTIVE"], enabled = true } = options;

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

  const filters: ProductFilters = {
    statuses,
    ...(companyId && { companyId }),
    ...(debouncedSearch && { search: debouncedSearch }),
    limit: PAGE_SIZE,
  };

  const query = useInfiniteQuery({
    queryKey: ["products", "infinite", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getContainer().productRepository.findAll({
        ...filters,
        page: pageParam as number,
      });
      return result as ProductSearchPage;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 min — datos de selector no necesitan ser muy frescos
    enabled,
  });

  // Aplanar todas las páginas en una lista de productos
  const products = query.data?.pages.flatMap((p) => p.data) ?? [];

  return {
    products,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isError: query.isError,
  };
}
