"use client";

import { useState } from "react";
import { PageHeader } from "@/modules/preview";
import { Button, Card, Input, Label } from "@/ui/components";

export function ConfiguracionPreview() {
  const [minutes, setMinutes] = useState("30");
  const [savedNotice, setSavedNotice] = useState(false);

  return (
    <div data-slot="admin-configuracion" className="space-y-4">
      <PageHeader title="Configuración" />

      <Card className="shadow-none p-6">
        <h2 className="text-sm font-semibold text-foreground">
          Cierre de sesión por inactividad
        </h2>
        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setSavedNotice(true);
          }}
        >
          <div className="max-w-xs space-y-2">
            <Label htmlFor="configuracion-minutos">Minutos</Label>
            <Input
              id="configuracion-minutos"
              type="number"
              min={1}
              inputMode="numeric"
              value={minutes}
              onChange={(event) => {
                setMinutes(event.target.value);
                setSavedNotice(false);
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" variant="default">
              Guardar
            </Button>
            {savedNotice ? (
              <p role="status" className="text-sm text-success-600">
                Cambios guardados en la maqueta
              </p>
            ) : null}
          </div>
        </form>
      </Card>
    </div>
  );
}
