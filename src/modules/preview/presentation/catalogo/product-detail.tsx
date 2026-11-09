"use client";

import { useState, type ReactNode } from "react";
import {
  PageHeader,
  PreviewSku,
  StatusChip,
  previewPhotoCopy,
  previewPhotoPlaceholder,
  previewScreens,
  type PreviewPhotoState,
  type PreviewProduct,
} from "@/modules/preview";
import { Button, Card, CardContent } from "@/ui/components";
import { CatalogTextLink } from "./catalog-field";

function ProductPhoto({
  initial,
  name,
}: {
  initial: PreviewPhotoState;
  name: string;
}) {
  const [photo, setPhoto] = useState<PreviewPhotoState>(initial);

  return (
    <div className="space-y-2" data-slot="product-photo" data-state={photo}>
      <p className="text-sm font-semibold text-foreground">
        Foto de referencia
      </p>
      {photo === "none" ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Sin foto de referencia.
          </p>
          <Button type="button" onClick={() => setPhoto("ready")}>
            {previewPhotoCopy.upload}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            role="img"
            aria-label={`Foto de ${name}`}
            className="size-40 rounded-md border border-border bg-cover bg-center"
            style={{ backgroundImage: `url("${previewPhotoPlaceholder}")` }}
          />
          {photo === "error" ? (
            <p className="text-sm text-destructive">{previewPhotoCopy.error}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-sm font-semibold text-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

export function ProductDetail({ product }: { product: PreviewProduct }) {
  return (
    <div className="space-y-4">
      <PageHeader title={product.name} />
      <Card className="shadow-none">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[160px_minmax(0,1fr)]">
          <ProductPhoto initial={product.photo} name={product.name} />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 content-start">
            <Fact label="Nombre">{product.name}</Fact>
            <Fact label="SKU">
              <PreviewSku>{product.sku}</PreviewSku>
            </Fact>
            <Fact label="Marca">{product.brand}</Fact>
            <Fact label="Categoría">{product.category}</Fact>
            <Fact label="Stock">{product.stock}</Fact>
            <Fact label="Estado">
              <StatusChip tone={product.statusTone}>
                {product.statusLabel}
              </StatusChip>
            </Fact>
          </dl>
        </CardContent>
      </Card>
      <CatalogTextLink href={previewScreens.productos.href}>
        Volver a productos
      </CatalogTextLink>
    </div>
  );
}
