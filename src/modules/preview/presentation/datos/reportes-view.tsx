import { PageHeader, previewCompany } from "@/modules/preview";
import { Button } from "@/ui/components/button";
import { Card } from "@/ui/components/card";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";

const reports = [
  "Stock por almacén",
  "Ventas por período",
  "Movimientos",
] as const;

export function ReportesView() {
  return (
    <div data-slot="datos-reportes" className="space-y-6">
      <PageHeader title="Reportes" />

      <p className="text-sm text-foreground">
        Alcance: {previewCompany.label} {previewCompany.name}
      </p>

      <div className="max-w-sm space-y-2">
        <Label htmlFor="rango-fechas">Rango de fechas</Label>
        <Input
          id="rango-fechas"
          readOnly
          defaultValue="1 nov 2026 – 6 nov 2026"
        />
      </div>

      <Card className="shadow-none">
        <ul className="divide-y divide-border">
          {reports.map((report) => (
            <li
              key={report}
              className="flex items-center justify-between gap-4 px-6 py-3"
            >
              <p className="text-sm font-semibold text-foreground">{report}</p>
              <Button type="button" variant="outline" className="shrink-0">
                Exportar Excel
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
