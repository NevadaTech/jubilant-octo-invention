"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/components/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const isDev = process.env.NODE_ENV === "development";

export default function Error({ error, reset }: ErrorProps) {
  const t = useTranslations("errors");

  useEffect(() => {
    if (isDev) console.error(error); // eslint-disable-line no-console
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">{t("somethingWentWrong")}</h1>
      <p className="text-muted-foreground">
        {isDev ? error.message : t("genericError")}
      </p>
      {!isDev && error.digest && (
        <p className="text-xs text-muted-foreground">
          {t("errorReference", { digest: error.digest })}
        </p>
      )}
      <Button onClick={reset}>{t("tryAgain")}</Button>
    </div>
  );
}
