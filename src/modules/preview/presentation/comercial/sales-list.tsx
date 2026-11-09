import { previewSaleStatusOptions, previewSales } from "./data";
import { DocumentList } from "./document-list";

export function SalesList() {
  return (
    <DocumentList
      title="Ventas"
      rows={previewSales}
      catalogTotal={86}
      actionLabel="Nueva venta"
      draftTitle="Nueva venta"
      draftNote="La maqueta no crea la venta."
      searchId="ventas-buscar"
      statusId="ventas-estado"
      draftId="nueva-venta"
      emptyLabel="Ninguna venta coincide."
      statusOptions={previewSaleStatusOptions}
      linkToSale
    />
  );
}
