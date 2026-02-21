"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { ContainerProvider } from "@/config/di/provider";
import { useAuthStore } from "@/modules/authentication/presentation/store/auth.store";
import { TokenService } from "@/modules/authentication/infrastructure/services/token.service";

interface ProvidersProps {
  children: ReactNode;
}

function AuthHydration({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Sync token to cookie so it's available after route changes and for middleware
  useEffect(() => {
    const syncTokenToCookie = () => {
      const token = TokenService.getAccessToken();
      const name =
        process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "nevada_auth_token";
      if (token) {
        document.cookie = `${name}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      } else {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    };

    syncTokenToCookie();

    // Listen for storage changes (in case another tab logs in/out)
    const tokenKey =
      process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "nevada_auth_token";
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === tokenKey) syncTokenToCookie();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isHydrated]);

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <ContainerProvider>
          <AuthHydration>{children}</AuthHydration>
        </ContainerProvider>
      </QueryClientProvider>
      <Toaster position="top-right" richColors closeButton />
    </ThemeProvider>
  );
}
