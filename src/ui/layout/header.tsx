"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useAuth } from "@/modules/authentication/presentation/hooks/use-auth";
import { useLogout } from "@/modules/authentication/presentation/hooks/use-logout";
import { LocaleSwitcher } from "./locale-switcher";
import { Button } from "@/ui/components/button";
import { GlobalCompanySelector } from "@/modules/companies/presentation/components";
import { cn } from "@/ui/lib/utils";

interface DashboardHeaderProps {
  className?: string;
}

export function DashboardHeader({ className }: DashboardHeaderProps) {
  const t = useTranslations();
  const { user } = useAuth();
  const { logout, isLoading } = useLogout();
  const { resolvedTheme, setTheme } = useTheme();

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
    : "";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-6",
        className,
      )}
    >
      <div className="flex min-w-0 items-center pl-28 lg:pl-0">
        <GlobalCompanySelector />
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xs font-semibold text-muted-foreground">
            {t("navigation.language")}
          </span>
          <LocaleSwitcher />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
        >
          {t("theme.label")}
        </Button>

        {displayName ? (
          <p className="hidden text-sm font-semibold text-foreground md:block">
            {displayName}
          </p>
        ) : null}

        <Button
          type="button"
          variant="outline"
          onClick={() => logout()}
          disabled={isLoading}
        >
          {t("auth.logout")}
        </Button>
      </div>
    </header>
  );
}
