import {
  PageHeader,
  StatusChip,
  type PreviewStatusTone,
} from "@/modules/preview";
import { Button, Card } from "@/ui/components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/components/table";
import { LabeledFilter } from "./labeled-filter";

const stockRows: readonly {
  product: string;
  warehouse: string;
  available: number;
  reserved: number;
  minimum: number;
  status: string;
  tone: PreviewStatusTone;
}[] = [
  {
    product: "Cable HDMI 2m",
    warehouse: "Bodega Norte",
    available: 3,
    reserved: 0,
    minimum: 20,
    status: "Stock bajo",
    tone: "pendiente",
  },
  {
    product: "Audífonos Pulse",
    warehouse: "Bodega Norte",
    available: 128,
    reserved: 4,
    minimum: 10,
    status: "Activo",
    tone: "hecho",
  },
  {
    product: "Combo Escritorio",
    warehouse: "Bodega Norte",
    available: 12,
    reserved: 1,
    minimum: 5,
    status: "Activo",
    tone: "hecho",
  },
];

export function StockLevelsView() {
  return (
    <section data-slot="operaciones-stock" className="flex flex-col gap-4">
      <PageHeader title="Niveles de stock" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <LabeledFilter
          id="stock-warehouse"
          label="Almacén"
          value="Bodega Norte"
        />
        <Button type="button" variant="outline">
          Exportar
        </Button>
      </div>
      <Card className="shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold text-foreground">
                Producto
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Almacén
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">
                Disponible
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">
                Reservado
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">
                Mínimo
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockRows.map((row) => (
              <TableRow key={row.product}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground">
                      {row.product}
                    </span>
                    <StatusChip tone={row.tone}>{row.status}</StatusChip>
                  </div>
                </TableCell>
                <TableCell>{row.warehouse}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.available}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.reserved}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.minimum}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </section>
  );
}
