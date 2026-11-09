import type { ReactNode } from "react";
import { Badge } from "@/ui/components/badge";
import { cn } from "@/ui/lib/utils";
import type { PreviewStatusTone } from "../fixtures";

export const previewStatusLabels: Record<PreviewStatusTone, string> = {
  hecho: "Hecho",
  pendiente: "Pendiente",
  peligro: "Peligro",
  borrador: "Borrador",
};

const toneClassName: Record<PreviewStatusTone, string> = {
  hecho: "border-transparent bg-success-100 text-success-600",
  pendiente: "border-transparent bg-warning-100 text-warning-600",
  peligro: "border-transparent bg-error-100 text-destructive",
  borrador: "border-neutral-200 bg-background text-neutral-500",
};

export interface StatusChipProps {
  tone: PreviewStatusTone;
  /** Si se omite, la pastilla muestra Hecho, Pendiente, Peligro o Borrador. */
  children?: ReactNode;
  className?: string;
}

export function StatusChip({ tone, children, className }: StatusChipProps) {
  return (
    <Badge
      data-slot="status-chip"
      data-tone={tone}
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
        toneClassName[tone],
        className,
      )}
    >
      {children ?? previewStatusLabels[tone]}
    </Badge>
  );
}
