"use client";

import type { FormEvent } from "react";
import { Link } from "@/i18n/navigation";
import { PageHeader, previewCompany, previewScreens } from "@/modules/preview";
import { Button, Card, CardContent, Input } from "@/ui/components";
import { CatalogField } from "./catalog-field";

const skuError = "Este SKU ya existe en la empresa.";

export function ProductForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="space-y-4">
      <PageHeader title={previewScreens.productoNuevo.label} />
      <Card className="shadow-none">
        <CardContent className="p-6">
          <form
            className="space-y-4"
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <CatalogField id="empresa" label={previewCompany.label}>
              <Input
                id="empresa"
                value={previewCompany.name}
                readOnly
                aria-readonly="true"
                className="bg-muted"
              />
            </CatalogField>
            <div className="grid gap-4 md:grid-cols-2">
              <CatalogField id="nombre" label="Nombre">
                <Input id="nombre" name="nombre" />
              </CatalogField>
              <CatalogField id="sku" label="SKU" error={skuError}>
                <Input
                  id="sku"
                  name="sku"
                  defaultValue="NV-HDMI-2M"
                  aria-invalid="true"
                  aria-describedby="sku-error"
                  className="border-destructive ring-2 ring-destructive/25 focus-visible:ring-destructive"
                />
              </CatalogField>
              <CatalogField id="marca" label="Marca">
                <Input id="marca" name="marca" />
              </CatalogField>
              <CatalogField id="categoria" label="Categoría">
                <Input id="categoria" name="categoria" />
              </CatalogField>
              <CatalogField id="precio" label="Precio">
                <Input id="precio" name="precio" inputMode="decimal" />
              </CatalogField>
              <CatalogField id="stock-minimo" label="Stock mínimo">
                <Input
                  id="stock-minimo"
                  name="stockMinimo"
                  inputMode="numeric"
                />
              </CatalogField>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href={previewScreens.productos.href}>Cancelar</Link>
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
