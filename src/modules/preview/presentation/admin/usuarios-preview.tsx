"use client";

import { useState } from "react";
import {
  ConfirmDialog,
  PageHeader,
  StatusChip,
  previewUser,
} from "@/modules/preview";
import { Button, Card, Input, Label } from "@/ui/components";

const ROLES = ["Administración", "Operación", "Comercial"] as const;

type AdminRole = (typeof ROLES)[number];
type AdminUserStatus = "Activo" | "Inactivo";

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminUserStatus;
}

const INITIAL_USERS: AdminUserRow[] = [
  {
    id: "ana",
    name: previewUser.name,
    email: "ana.perez@nevada.example",
    role: "Administración",
    status: "Activo",
  },
  {
    id: "luis",
    name: "Luis Gómez",
    email: "luis.gomez@nevada.example",
    role: "Operación",
    status: "Activo",
  },
  {
    id: "marta",
    name: "Marta Ríos",
    email: "marta.rios@nevada.example",
    role: "Comercial",
    status: "Inactivo",
  },
];

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function UsuariosPreview() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("Operación");
  const [deactivateLuis, setDeactivateLuis] = useState(false);

  const closeCreate = () => {
    setCreating(false);
    setName("");
    setEmail("");
    setRole("Operación");
  };

  const deactivate = () => {
    setUsers((current) =>
      current.map((user) =>
        user.id === "luis" ? { ...user, status: "Inactivo" } : user,
      ),
    );
    setDeactivateLuis(false);
  };

  return (
    <div data-slot="admin-usuarios" className="space-y-4">
      <PageHeader
        title="Usuarios"
        action={
          creating ? null : (
            <Button
              type="button"
              variant="default"
              onClick={() => setCreating(true)}
            >
              Nuevo usuario
            </Button>
          )
        }
      />

      {creating ? (
        <Card className="shadow-none p-6">
          <h2 className="text-sm font-semibold text-foreground">
            Nuevo usuario
          </h2>
          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              closeCreate();
            }}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="usuario-nombre">Nombre</Label>
                <Input
                  id="usuario-nombre"
                  value={name}
                  autoComplete="off"
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usuario-correo">Correo</Label>
                <Input
                  id="usuario-correo"
                  type="email"
                  value={email}
                  autoComplete="off"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usuario-rol">Rol</Label>
                <select
                  id="usuario-rol"
                  className={selectClassName}
                  value={role}
                  onChange={(event) => setRole(event.target.value as AdminRole)}
                >
                  {ROLES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeCreate}>
                Cancelar
              </Button>
              <Button type="submit" variant="default">
                Guardar
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card className="shadow-none">
        <div className="overflow-x-auto">
          <table aria-label="Usuarios" className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-sm font-medium text-muted-foreground">
                <th className="px-4 py-3 font-medium" scope="col">
                  Nombre
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Correo
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Rol
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Estado
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-foreground">{user.email}</td>
                  <td className="px-4 py-3 text-foreground">{user.role}</td>
                  <td className="px-4 py-3">
                    <StatusChip
                      tone={user.status === "Activo" ? "hecho" : "peligro"}
                    >
                      {user.status}
                    </StatusChip>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button type="button" variant="outline">
                        Editar
                      </Button>
                      {user.id === "luis" && user.status === "Activo" ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDeactivateLuis(true)}
                        >
                          Desactivar
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={deactivateLuis}
        title="Desactivar usuario"
        description="Luis Gómez quedará inactivo y no podrá entrar a Nevada."
        confirmLabel="Desactivar"
        destructive
        onConfirm={deactivate}
        onCancel={() => setDeactivateLuis(false)}
      />
    </div>
  );
}
