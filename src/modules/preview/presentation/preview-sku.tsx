import type { ReactNode } from "react";
import { cn } from "@/ui/lib/utils";
import { previewSkuFontFamily } from "./typography";

export function PreviewSku({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      data-slot="preview-sku"
      className={cn("text-sm font-medium", className)}
      style={{ fontFamily: previewSkuFontFamily }}
    >
      {children}
    </span>
  );
}
