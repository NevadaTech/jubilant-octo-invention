"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Package } from "lucide-react";
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
  const image = useProductImage(productId, imageUrl !== null);
  const src = useObjectUrl(image.data);

  if (!src) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
        <Package className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
      </div>
    );
  }

  return (
    // The bytes come from an authenticated blob URL, so the image optimizer cannot fetch them.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={t("alt", { name: productName })}
      className="h-10 w-10 rounded-lg border border-border object-cover"
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
  const src = useObjectUrl(image.data);
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
    <section className="space-y-3" aria-label={t("title")}>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("purpose")}</p>
      </div>
      {src ? (
        // The bytes come from an authenticated blob URL, so the image optimizer cannot fetch them.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={t("alt", { name: productName })}
          className="size-40 rounded-md border border-border object-cover"
        />
      ) : (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      )}
      {localError ? (
        <p className="text-sm text-destructive" role="alert">
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
            {t("upload")}
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
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
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
