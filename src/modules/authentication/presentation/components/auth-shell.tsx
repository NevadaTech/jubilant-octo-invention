"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/ui/components/card";
import { Label } from "@/ui/components/label";
import { cn } from "@/ui/lib/utils";

const FACTS = [
  ["permissionsTitle", "permissionsText"],
  ["statesTitle", "statesText"],
  ["auditTitle", "auditText"],
] as const;

export function authControlClass(invalid?: boolean) {
  return cn(
    "h-10 rounded-lg",
    invalid && "border-destructive focus-visible:ring-destructive",
  );
}

export function AuthTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-[22px] font-semibold leading-tight text-foreground lg:text-[26px]">
      {children}
    </h1>
  );
}

export function AuthDescription({ children }: { children: ReactNode }) {
  return (
    <p className="text-[15px] leading-normal text-muted-foreground">{children}</p>
  );
}

export function AuthField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="text-[13px] font-semibold leading-none text-foreground"
      >
        {label}
      </Label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-[13px] leading-snug text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function AuthBrand() {
  const t = useTranslations("auth.brand");

  return (
    <div className="flex w-full max-w-[440px] flex-col gap-4 lg:w-[440px] lg:shrink-0 lg:gap-7">
      <p className="text-[32px] font-bold leading-none text-foreground lg:text-[48px]">
        {t("name")}
      </p>
      <p className="text-[15px] leading-snug text-muted-foreground lg:text-lg">
        {t("purpose")}
      </p>
      <div className="hidden flex-col gap-4 lg:flex">
        {FACTS.map(([titleKey, bodyKey]) => (
          <div key={titleKey} className="flex flex-col gap-0.5">
            <p className="text-[15px] font-semibold text-foreground">
              {t(titleKey)}
            </p>
            <p className="text-sm leading-snug text-muted-foreground">
              {t(bodyKey)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuthSplit({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col gap-7 bg-background px-6 py-6 lg:flex-row lg:items-center lg:justify-center lg:gap-24 lg:px-6">
      <AuthBrand />
      <Card className="w-full border-border bg-card p-5 shadow-none lg:w-[420px] lg:shrink-0 lg:p-7">
        {children}
      </Card>
    </div>
  );
}

export function AuthCentered({
  children,
  width = "440",
}: {
  children: ReactNode;
  width?: "420" | "440";
}) {
  const t = useTranslations("auth.brand");

  return (
    <div className="flex min-h-screen flex-col gap-4 bg-background px-6 py-6 lg:items-center lg:justify-center">
      <p className="text-[22px] font-bold leading-none text-primary lg:hidden">
        {t("name")}
      </p>
      <Card
        className={cn(
          "w-full border-0 bg-transparent p-0 shadow-none lg:border lg:border-border lg:bg-card lg:p-7",
          width === "420" ? "lg:w-[420px]" : "lg:w-[440px]",
        )}
      >
        {children}
      </Card>
    </div>
  );
}
