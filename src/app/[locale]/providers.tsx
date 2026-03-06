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
import { useIdleTimeout } from "@/shared/presentation/hooks/use-idle-timeout";
import { SessionTimeoutDialog } from "@/shared/presentation/components/session-timeout-dialog";

interface ProvidersProps {
  children: ReactNode;
}

function AuthHydration({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate);
  const forceLogout = useAuthStore((state) => state.forceLogout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const t = useTranslations("auth");
  const isHandlingExpiryRef = useRef(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Handle session expiration events from the HTTP interceptor
  const handleSessionExpired = useCallback(() => {
    if (isHandlingExpiryRef.current) return;
    isHandlingExpiryRef.current = true;

    forceLogout();
    toast.error(t("sessionExpired"));
    router.replace("/login");

    setTimeout(() => {
      isHandlingExpiryRef.current = false;
    }, 3000);
  }, [forceLogout, router, t]);

  useEffect(() => {
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, [handleSessionExpired]);

  // Idle timeout — only active when authenticated
  const {
    showWarning,
    remainingSeconds,
    onExtend,
    onLogout: onIdleLogout,
  } = useIdleTimeout({
    enabled: isAuthenticated,
    warningSeconds: 120,
    timeoutSeconds: 900, // 15 min
    onTimeout: handleSessionExpired,
  });

  return (
    <>
      {children}
      <SessionTimeoutDialog
        open={showWarning}
        remainingSeconds={remainingSeconds}
        onExtend={onExtend}
        onLogout={onIdleLogout}
      />
    </>
  );
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
