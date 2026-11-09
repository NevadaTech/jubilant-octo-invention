"use client";

import { useState } from "react";
import { PageHeader } from "@/modules/preview";
import { Button, Card } from "@/ui/components";

type PermissionKey =
  | "productosLeer"
  | "stockLeer"
  | "movimientos"
  | "transferencias"
  | "ventasLeer"
  | "ventasConfirmar";

const INITIAL_PERMISSIONS: Record<PermissionKey, boolean> = {
  productosLeer: true,
  stockLeer: true,
  movimientos: true,
  transferencias: true,
  ventasLeer: true,
  ventasConfirmar: false,
};

const PERMISSION_GROUPS: {
  title: string;
  items: { key: PermissionKey; label: string }[];
}[] = [
  {
    title: "Productos",
    items: [{ key: "productosLeer", label: "Productos leer" }],
  },
  {
    title: "Stock",
    items: [{ key: "stockLeer", label: "Stock leer" }],
  },
  {
    title: "Movimientos",
    items: [{ key: "movimientos", label: "Movimientos crear y publicar" }],
  },
  {
    title: "Transferencias",
    items: [{ key: "transferencias", label: "Transferencias" }],
  },
  {
    title: "Ventas",
    items: [
      { key: "ventasLeer", label: "Ventas leer" },
      { key: "ventasConfirmar", label: "Ventas confirmar" },
    ],
  },
];

export function RolesPreview() {
  const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);
  const [committed, setCommitted] = useState(INITIAL_PERMISSIONS);
  const [savedNotice, setSavedNotice] = useState(false);

  const toggle = (key: PermissionKey, checked: boolean) => {
    setPermissions((current) => ({ ...current, [key]: checked }));
    setSavedNotice(false);
  };

  return (
    <div data-slot="admin-roles" className="space-y-4">
      <PageHeader title="Rol Operación" />

      <Card className="shadow-none p-6">
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            setCommitted({ ...permissions });
            setSavedNotice(true);
          }}
        >
          <div className="space-y-6">
            {PERMISSION_GROUPS.map((group) => (
              <fieldset key={group.title} className="space-y-3">
                <legend className="text-sm font-semibold text-foreground">
                  {group.title}
                </legend>
                <div className="flex flex-col gap-2">
                  {group.items.map((item) => {
                    const id = `permiso-${item.key}`;
                    return (
                      <label
                        key={item.key}
                        htmlFor={id}
                        className="flex w-fit items-center gap-2 text-sm font-medium text-foreground"
                      >
                        <input
                          id={id}
                          type="checkbox"
                          className="size-4 shrink-0 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          checked={permissions[item.key]}
                          onChange={(event) =>
                            toggle(item.key, event.target.checked)
                          }
                        />
                        {item.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="flex items-center justify-end gap-4 border-t border-border pt-4">
            {savedNotice ? (
              <p role="status" className="mr-auto text-sm text-success-600">
                Cambios guardados en la maqueta
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPermissions({ ...committed });
                setSavedNotice(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="default">
              Guardar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
