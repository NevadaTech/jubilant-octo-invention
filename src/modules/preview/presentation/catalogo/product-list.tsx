"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  PageHeader,
  PreviewSku,
  StatusChip,
  previewProductPath,
  previewProducts,
  previewScreens,
} from "@/modules/preview";
import { Button, Card, Input, Label } from "@/ui/components";
import { cn } from "@/ui/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/components/table";
import {
  CatalogField,
  CatalogTextLink,
  catalogSelectClassName,
} from "./catalog-field";

function uniqueValues(values: readonly string[]) {
  return Array.from(new Set(values));
}

function showingLabel(count: number, totalRows: number) {
  if (count === totalRows) return "Mostrando 1 a 3 de 1.248";
  if (count === 0) return "Mostrando 0 de 1.248";
  return `Mostrando 1 a ${count} de 1.248`;
}

export function ProductList() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");

  const categories = uniqueValues(
    previewProducts.map((product) => product.category),
  );
  const brands = uniqueValues(previewProducts.map((product) => product.brand));

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");
    return previewProducts.filter((product) => {
      if (category && product.category !== category) return false;
      if (brand && product.brand !== brand) return false;
      if (!query) return true;
      const haystack = [
        product.sku,
        product.name,
        product.brand,
        product.category,
      ]
        .join(" ")
        .toLocaleLowerCase("es");
      return haystack.includes(query);
    });
  }, [brand, category, search]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={previewScreens.productos.label}
        action={
          <Button asChild>
            <Link href={previewScreens.productoNuevo.href}>Nuevo producto</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <CatalogField id="buscar" label="Buscar">
          <Input
            id="buscar"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </CatalogField>
        <CatalogField id="filtro-categoria" label="Categoría">
          <select
            id="filtro-categoria"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={catalogSelectClassName}
          >
            <option value="">Todas</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </CatalogField>
        <CatalogField id="filtro-marca" label="Marca">
          <select
            id="filtro-marca"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            className={catalogSelectClassName}
          >
            <option value="">Todas</option>
            {brands.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </CatalogField>
      </div>

      <Card className="shadow-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-muted-foreground">
                  Ningún producto coincide.
                </TableCell>
              </TableRow>
            ) : (
              visibleProducts.map((product) => (
                <TableRow key={product.sku}>
                  <TableCell>
                    <PreviewSku>{product.sku}</PreviewSku>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {product.name}
                  </TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <StatusChip tone={product.statusTone}>
                      {product.statusLabel}
                    </StatusChip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <CatalogTextLink href={previewProductPath(product.sku)}>
                        Ver
                      </CatalogTextLink>
                      <CatalogTextLink href={previewProductPath(product.sku)}>
                        Editar
                      </CatalogTextLink>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex flex-col gap-4 border-t px-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {showingLabel(visibleProducts.length, previewProducts.length)}
          </p>
          <div className="flex items-center gap-2">
            <Label htmlFor="por-pagina">Por página</Label>
            <select
              id="por-pagina"
              defaultValue="25"
              className={cn(catalogSelectClassName, "w-24")}
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );
}
