"use client";

import { useState } from "react";
import { PageHeader, StatusChip } from "@/modules/preview";
import { Button } from "@/ui/components/button";
import { Card } from "@/ui/components/card";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";

export function IntegracionesView() {
  const [connected, setConnected] = useState(false);

  return (
    <div data-slot="datos-integraciones" className="space-y-6">
      <PageHeader title="Integraciones" />

      <Card className="max-w-lg space-y-6 p-6 shadow-none">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-foreground">VTEX</h2>
          <StatusChip tone={connected ? "hecho" : "peligro"}>
            {connected ? "Conectada" : "Desconectada"}
          </StatusChip>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cuenta-vtex">Cuenta</Label>
          <Input id="cuenta-vtex" defaultValue="nevada-retail" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="token-vtex">Token</Label>
          <Input
            id="token-vtex"
            type="text"
            readOnly
            value="••••••••••••"
            autoComplete="off"
          />
        </div>

        <div className="flex justify-end">
          <Button type="button" onClick={() => setConnected(true)}>
            Conectar
          </Button>
        </div>
      </Card>
    </div>
  );
}
