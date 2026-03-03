"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState, useEffect, useCallback, useRef } from "react";
import { Toaster, toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ContainerProvider } from "@/config/di/provider";
import { useAuthStore } from "@/modules/authentication/presentation/store/auth.store";
import { TokenService } from "@/modules/authentication/infrastructure/services/token.service";

interface ProvidersProps {
  children: ReactNode;
}

function AuthHydration({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate);
  const forceLogout = useAuthStore((state) => state.forceLogout);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const router = useRouter();
  const t = useTranslations("auth");
  const isHandlingExpiryRef = useRef(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Handle session expiration events from the HTTP interceptor
  const handleSessionExpired = useCallback(() => {
    // Prevent multiple toasts/redirects from concurrent 401s
    if (isHandlingExpiryRef.current) return;
    isHandlingExpiryRef.current = true;

    forceLogout();
    toast.error(t("sessionExpired"));
    router.replace("/login");

    // Reset after a short delay to allow future expiration events
    setTimeout(() => {
      isHandlingExpiryRef.current = false;
    }, 3000);
  }, [forceLogout, router, t]);

  useEffect(() => {
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, [handleSessionExpired]);

  // Sync token to cookie so it's available after route changes and for middleware
  useEffect(() => {
    const syncTokenToCookie = () => {
      const token = TokenService.getAccessToken();
      const name =
        process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "nevada_auth_token";
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      if (token) {
        document.cookie = `${name}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secure}`;
      } else {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}`;
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
