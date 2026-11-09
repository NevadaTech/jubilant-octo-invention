"use client";

import { Fragment, useState, type ReactNode } from "react";
import type { Route } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/ui/primitives/button";
import { Card, CardContent, CardHeader } from "@/ui/primitives/card";
import { cn } from "@/ui/lib/utils";
import {
  previewPhotoCopy,
  previewPhotoPlaceholder,
  previewProducts,
} from "../fixtures";
import {
  previewIndexSections,
  previewProductPath,
  previewScreens,
} from "../navigation";
import { ConfirmDialog } from "./confirm-dialog";
import { PageHeader } from "./page-header";
import { PreviewSku } from "./preview-sku";
import { StatusChip } from "./status-chip";
import { previewFocusClassName } from "./typography";

function ScreenLink({ href, children }: { href: Route; children: ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "rounded-sm text-sm font-semibold text-primary-600 underline-offset-4 hover:underline",
          previewFocusClassName,
        )}
      >
        {children}
      </Link>
    </li>
  );
}

export function PreviewIndex() {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Índice"
        action={
          <Button type="button" onClick={() => setConfirmOpen(true)}>
            Confirmar acción
          </Button>
        }
      />

      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-muted-foreground">Estados</h2>
        <div className="flex flex-wrap gap-2">
          <StatusChip tone="hecho" />
          <StatusChip tone="pendiente" />
          <StatusChip tone="peligro" />
          <StatusChip tone="borrador" />
        </div>
      </section>

      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <h2 className="text-sm font-semibold text-foreground">
            Datos de maqueta
          </h2>
        </CardHeader>
        <CardContent className="pt-0">
          <ul>
            {previewProducts.map((product) => (
              <li
                key={product.sku}
                className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-sm text-foreground">
                    <PreviewSku>{product.sku}</PreviewSku> {product.name}
                  </p>
                  {product.photo === "none" ? (
                    <p className="text-sm text-muted-foreground">
                      {previewPhotoCopy.upload}
                    </p>
                  ) : null}
                  {product.photo === "ready" ? (
                    <div
                      role="img"
                      aria-label={`Foto de ${product.name}`}
                      className="h-10 w-10 rounded-md border border-border bg-cover"
                      style={{
                        backgroundImage: `url("${previewPhotoPlaceholder}")`,
                      }}
                    />
                  ) : null}
                  {product.photo === "error" ? (
                    <p className="text-sm text-destructive">
                      {previewPhotoCopy.error}
                    </p>
                  ) : null}
                </div>
                <StatusChip tone={product.statusTone}>
                  {product.statusLabel}
                </StatusChip>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Pantallas</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {previewIndexSections.map((section) => (
            <Card key={section.title} className="shadow-none">
              <CardHeader className="pb-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {section.title}
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <Fragment key={link.href}>
                      <ScreenLink href={link.href}>{link.label}</ScreenLink>
                      {link.href === previewScreens.productoNuevo.href
                        ? previewProducts.map((product) => (
                            <ScreenLink
                              key={product.sku}
                              href={previewProductPath(product.sku)}
                            >
                              <PreviewSku>{product.sku}</PreviewSku>{" "}
                              {product.name}
                            </ScreenLink>
                          ))
                        : null}
                    </Fragment>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar acción"
        description="Esta acción no se puede deshacer."
        confirmLabel="Confirmar"
        onConfirm={() => setConfirmOpen(false)}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
