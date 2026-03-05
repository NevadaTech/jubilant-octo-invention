"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/modules/authentication/presentation/hooks/use-auth";
import { useLogout } from "@/modules/authentication/presentation/hooks/use-logout";
import { LocaleSwitcher } from "./locale-switcher";
import { Button } from "@/ui/components/button";
import { UserAvatar } from "@/ui/components/user-avatar";
import { GlobalCompanySelector } from "@/modules/companies/presentation/components";
import { cn } from "@/ui/lib/utils";

interface DashboardHeaderProps {
  className?: string;
}

export function DashboardHeader({ className }: DashboardHeaderProps) {
  const t = useTranslations();
  const { user } = useAuth();
  const { logout, isLoading } = useLogout();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/95 px-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95 lg:px-6",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 lg:hidden" />
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={
            mounted
              ? theme === "dark"
                ? t("theme.light")
                : t("theme.dark")
              : undefined
          }
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </Button>

        <LocaleSwitcher />

        <GlobalCompanySelector />

        {user && (
          <div className="flex items-center gap-3">
            <UserAvatar
              name={user.email}
              size={32}
              className="hidden md:block"
            />
            <div className="hidden text-right text-sm md:block">
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {user.email}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              disabled={isLoading}
              title={t("auth.logout")}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
