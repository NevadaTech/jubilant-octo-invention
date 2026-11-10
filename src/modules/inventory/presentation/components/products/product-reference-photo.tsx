"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/components/alert-dialog";
import { usePermissions } from "@/modules/authentication/presentation/hooks/use-permissions";
import { productImageViewSrc } from "@/modules/inventory/application/ports/product.repository.port";
import {
  useDeleteProductImage,
  useProductImage,
  useUploadProductImage,
} from "@/modules/inventory/presentation/hooks/use-products";
import { PERMISSIONS } from "@/shared/domain/permissions";

const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

function isAcceptedPhoto(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp")
  );
}

export function ProductReferenceThumb({
  productId,
  productName,
  imageUrl,
}: {
  productId: string;
  productName: string;
  imageUrl?: string | null;
}) {
  const t = useTranslations("inventory.products.photo");
  const image = useProductImage(productId, Boolean(imageUrl));
  const src = productImageViewSrc(
    image.data,
    useObjectUrl(image.data?.kind === "inline" ? image.data.blob : null),
  );

  if (!imageUrl) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted px-1 text-center text-[10px] font-semibold leading-tight text-muted-foreground">
        {t("none")}
      </div>
    );
  }

  if (!src) {
    return <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-muted" />;
  }

  return (
    // The bytes come from an authenticated blob URL, so the image optimizer cannot fetch them.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={t("alt", { name: productName })}
      className="h-14 w-14 shrink-0 rounded-xl border border-border object-cover"
    />
  );
}

export function ProductReferencePhoto({
  productId,
  productName,
  imageUrl,
}: {
  productId: string;
  productName: string;
  imageUrl: string | null;
}) {
  const t = useTranslations("inventory.products.photo");
  const tCommon = useTranslations("common");
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission(PERMISSIONS.PRODUCTS_UPDATE);
  const image = useProductImage(productId, Boolean(imageUrl));
  const upload = useUploadProductImage();
  const remove = useDeleteProductImage();
  const src = productImageViewSrc(
    image.data,
    useObjectUrl(image.data?.kind === "inline" ? image.data.blob : null),
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const chooseFile = (file: File | undefined) => {
    if (!file) return;
    if (!isAcceptedPhoto(file)) {
      setLocalError(t("invalidType"));
      return;
    }
    if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
      setLocalError(t("tooLarge"));
      return;
    }
    setLocalError(null);
    upload.mutate(
      { productId, file },
      {
        onError: () => setLocalError(t("error")),
      },
    );
  };

  return (
    <section className="flex flex-col gap-5 sm:flex-row" aria-label={t("title")}>
      {src ? (
        // The bytes come from an authenticated blob URL, so the image optimizer cannot fetch them.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={t("alt", { name: productName })}
          className="size-[180px] shrink-0 rounded-xl border border-border object-cover"
        />
      ) : imageUrl && image.isError ? (
        <div className="flex size-[180px] shrink-0 items-center justify-center rounded-xl bg-muted px-3 text-center text-sm text-muted-foreground">
          {t("loadError")}
        </div>
      ) : imageUrl ? (
        <div className="size-[180px] shrink-0 animate-pulse rounded-xl bg-muted" />
      ) : (
        <div className="flex size-[180px] shrink-0 items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
          {t("none")}
        </div>
      )}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {src ? t("purpose") : imageUrl && image.isError ? t("loadError") : t("empty")}
        </p>
        {localError ? (
          <p
            className="max-w-lg rounded-lg bg-error-100 px-3 py-3 text-sm text-destructive"
            role="alert"
          >
            {localError}
          </p>
        ) : null}
        {canUpdate ? (
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                chooseFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <Button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={upload.isPending}
            >
              {src ? t("change") : t("upload")}
            </Button>
            {src ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmOpen(true)}
                disabled={remove.isPending}
              >
                {t("remove")}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="shadow-none">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("removeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("removeDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                remove.mutate(productId);
                setConfirmOpen(false);
              }}
              disabled={remove.isPending}
            >
              {t("remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
