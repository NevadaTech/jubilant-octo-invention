import { Link } from "@/i18n/navigation";
import { PageHeader, previewScreens } from "@/modules/preview";
import { Button, Card } from "@/ui/components";

const warehouses = ["Bodega Norte", "Bodega Centro"] as const;

export function WarehousesView() {
  return (
    <section data-slot="operaciones-almacenes" className="flex flex-col gap-4">
      <PageHeader
        title="Almacenes"
        action={<Button type="button">Nuevo almacén</Button>}
      />
      <Card className="shadow-none">
        <ul>
          {warehouses.map((warehouse) => (
            <li
              key={warehouse}
              className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0"
            >
              <span className="text-sm font-semibold text-foreground">
                {warehouse}
              </span>
              <Button variant="outline" asChild>
                <Link
                  href={previewScreens.transferencias.href}
                  aria-label={`Ver ${warehouse}`}
                >
                  Ver
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
