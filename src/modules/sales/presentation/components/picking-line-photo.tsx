"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/ui/lib/utils";
import { useProductImage } from "@/modules/inventory/presentation/hooks/use-products";

function useObjectUrl(blob: Blob | null | undefined): string | null {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setSrc(null);
      return;
    }
    const url = URL.createObjectURL(blob);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  return src;
}

interface PickingLinePhotoProps {
  productId: string;
  productName: string;
  size: "thumb" | "reference";
}

export function PickingLinePhoto({
  productId,
  productName,
  size,
}: PickingLinePhotoProps) {
  const t = useTranslations("sales.picking");
  const tPhoto = useTranslations("inventory.products.photo");
  const image = useProductImage(productId, Boolean(productId));
  const src = useObjectUrl(image.data);
  const frame =
    size === "thumb"
      ? "size-16 shrink-0 text-xs"
      : "h-[200px] w-full max-w-[220px] text-base lg:size-[220px]";

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-muted px-2 text-center text-muted-foreground",
          frame,
        )}
      >
        {t("noPhoto")}
      </div>
    );
  }

  return (
    // Authenticated blob URLs cannot go through the image optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={tPhoto("alt", { name: productName })}
      className={cn(
        "rounded-xl border border-border bg-primary/10 object-cover",
        frame,
      )}
    />
  );
}
