"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/components/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error(error); // eslint-disable-line no-console
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">{t("somethingWentWrong")}</h1>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>{t("tryAgain")}</Button>
    </div>
  );
}
