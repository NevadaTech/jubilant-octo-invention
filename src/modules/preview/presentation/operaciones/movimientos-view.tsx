import {
  PageHeader,
  PreviewSku,
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

const movements: readonly {
  number: string;
  type: string;
  warehouse: string;
  status: string;
  tone: PreviewStatusTone;
  date: string;
}[] = [
  {
    number: "MOV-1042",
    type: "Salida",
    warehouse: "Bodega Norte",
    status: "Borrador",
    tone: "borrador",
    date: "6 nov 2026",
  },
  {
    number: "MOV-1041",
    type: "Entrada",
    warehouse: "Bodega Centro",
    status: "Publicado",
    tone: "hecho",
    date: "5 nov 2026",
  },
  {
    number: "MOV-1038",
    type: "Ajuste",
    warehouse: "Bodega Norte",
    status: "Anulado",
    tone: "peligro",
    date: "4 nov 2026",
  },
];

export function MovementsView() {
  return (
    <section
      data-slot="operaciones-movimientos"
      className="flex flex-col gap-4"
    >
      <PageHeader
        title="Movimientos"
        action={<Button type="button">Nuevo movimiento</Button>}
      />
      <LabeledFilter id="movement-status" label="Estado" value="Todos" />
      <Card className="shadow-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold text-foreground">
                Número
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Tipo
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Almacén
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Estado
              </TableHead>
              <TableHead className="font-semibold text-foreground">
                Fecha
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.number}>
                <TableCell>
                  <PreviewSku>{movement.number}</PreviewSku>
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  {movement.type}
                </TableCell>
                <TableCell>{movement.warehouse}</TableCell>
                <TableCell>
                  <StatusChip tone={movement.tone}>
                    {movement.status}
                  </StatusChip>
                </TableCell>
                <TableCell>{movement.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </section>
  );
}
