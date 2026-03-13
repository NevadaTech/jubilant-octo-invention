import { QueryClient, dehydrate } from "@tanstack/react-query";

export function createServerQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

export function dehydrateState(queryClient: QueryClient) {
  return JSON.parse(JSON.stringify(dehydrate(queryClient)));
}
