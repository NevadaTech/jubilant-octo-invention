"use client";

import { useTheme } from "next-themes";
import { Button } from "@/ui/primitives/button";
import { previewCompany, previewLocale, previewUser } from "../fixtures";

export function PreviewHeader() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header
      data-slot="preview-header"
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-6"
    >
      <p className="flex items-baseline gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          {previewCompany.label}
        </span>
        <span className="text-sm font-semibold text-foreground">
          {previewCompany.name}
        </span>
      </p>
      <div className="flex items-center gap-4">
        <p className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            {previewLocale.label}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {previewLocale.value}
          </span>
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          Tema
        </Button>
        <p className="text-sm font-semibold text-foreground">
          {previewUser.name}
        </p>
        <Button type="button" variant="outline">
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
}
