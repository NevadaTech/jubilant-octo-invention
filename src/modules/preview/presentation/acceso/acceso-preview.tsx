"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/ui/components/button";
import { Card, CardContent, CardHeader } from "@/ui/components/card";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";

type AccesoFlow = "sign-in" | "reset" | "force-change";

const loginError =
  "Organización, correo o contraseña incorrectos. Inténtalo de nuevo.";

const forceChangeNotice =
  "Tu administrador te asignó una contraseña temporal. Por seguridad, debes establecer una nueva antes de acceder.";

function stopSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
}

function Field({
  id,
  label,
  type = "text",
  defaultValue,
  autoComplete,
  describedBy,
  invalid = false,
}: {
  id: string;
  label: string;
  type?: string;
  defaultValue?: string;
  autoComplete?: string;
  describedBy?: string;
  invalid?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
      />
    </div>
  );
}

function PrimaryButton({ children }: { children: string }) {
  return (
    <Button type="button" variant="default" className="w-full">
      {children}
    </Button>
  );
}

function FlowLink({
  children,
  onClick,
}: {
  children: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="link"
      className="h-auto justify-start px-0 py-0 text-sm font-semibold"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function AccesoFrame({
  title,
  description,
  notice,
  children,
}: {
  title: string;
  description?: string;
  notice?: string;
  children: ReactNode;
}) {
  return (
    <Card className="w-full max-w-[420px] shadow-none">
      <CardHeader className="space-y-4">
        <p className="text-sm font-semibold text-foreground">Nevada</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold leading-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="text-sm leading-normal text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {notice ? (
          <p className="rounded-md border border-border bg-warning-100 px-3 py-2 text-sm leading-normal text-foreground">
            {notice}
          </p>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function SignInFlow({
  onForgot,
  onForceChange,
}: {
  onForgot: () => void;
  onForceChange: () => void;
}) {
  const errorId = "acceso-error-credenciales";

  return (
    <AccesoFrame title="Bienvenido de nuevo">
      <form className="space-y-4" onSubmit={stopSubmit} noValidate>
        <Field
          id="acceso-organizacion"
          label="Organización"
          defaultValue="nevada"
          autoComplete="organization"
          describedBy={errorId}
          invalid
        />
        <Field
          id="acceso-correo"
          label="Correo electrónico"
          type="email"
          defaultValue="ana.perez@nevada.example"
          autoComplete="email"
          describedBy={errorId}
          invalid
        />
        <Field
          id="acceso-contrasena"
          label="Contraseña"
          type="password"
          defaultValue="temporal1"
          autoComplete="current-password"
          describedBy={errorId}
          invalid
        />
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {loginError}
        </p>
        <PrimaryButton>Iniciar sesión</PrimaryButton>
        <div className="flex flex-col items-start gap-2">
          <FlowLink onClick={onForgot}>¿Olvidaste tu contraseña?</FlowLink>
          <FlowLink onClick={onForceChange}>Cambia tu contraseña</FlowLink>
        </div>
      </form>
    </AccesoFrame>
  );
}

function ResetFlow({ onBack }: { onBack: () => void }) {
  return (
    <AccesoFrame
      title="Restablecer contraseña"
      description="Ingresa tu organización y correo para recibir un código de verificación."
    >
      <form className="space-y-4" onSubmit={stopSubmit} noValidate>
        <Field
          id="acceso-restablecer-organizacion"
          label="Organización"
          defaultValue="nevada"
          autoComplete="organization"
        />
        <Field
          id="acceso-restablecer-correo"
          label="Correo electrónico"
          type="email"
          defaultValue="ana.perez@nevada.example"
          autoComplete="email"
        />
        <PrimaryButton>Enviar código de verificación</PrimaryButton>
        <FlowLink onClick={onBack}>Volver a iniciar sesión</FlowLink>
      </form>
    </AccesoFrame>
  );
}

function ForceChangeFlow({ onBack }: { onBack: () => void }) {
  return (
    <AccesoFrame title="Cambia tu contraseña" notice={forceChangeNotice}>
      <form className="space-y-4" onSubmit={stopSubmit} noValidate>
        <Field
          id="acceso-nueva-contrasena"
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
        />
        <Field
          id="acceso-confirmar-contrasena"
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
        />
        <PrimaryButton>Establecer nueva contraseña</PrimaryButton>
        <FlowLink onClick={onBack}>Volver a iniciar sesión</FlowLink>
      </form>
    </AccesoFrame>
  );
}

export function AccesoPreview() {
  const [flow, setFlow] = useState<AccesoFlow>("sign-in");

  useEffect(() => {
    const covered = [
      document.querySelector("[data-slot='preview-sidebar']"),
      document.querySelector("[data-slot='preview-header']"),
    ].filter((node): node is HTMLElement => node instanceof HTMLElement);

    for (const node of covered) node.inert = true;
    return () => {
      for (const node of covered) node.inert = false;
    };
  }, []);

  return (
    <div
      data-slot="acceso-preview"
      data-flow={flow}
      className="flex min-h-full items-center justify-center p-6"
    >
      {flow === "sign-in" ? (
        <SignInFlow
          onForgot={() => setFlow("reset")}
          onForceChange={() => setFlow("force-change")}
        />
      ) : null}
      {flow === "reset" ? (
        <ResetFlow onBack={() => setFlow("sign-in")} />
      ) : null}
      {flow === "force-change" ? (
        <ForceChangeFlow onBack={() => setFlow("sign-in")} />
      ) : null}
    </div>
  );
}
