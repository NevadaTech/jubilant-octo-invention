import { previewReturnStatusOptions, previewReturns } from "./data";
import { DocumentList } from "./document-list";

export function ReturnsList() {
  return (
    <DocumentList
      title="Devoluciones"
      rows={previewReturns}
      catalogTotal={previewReturns.length}
      actionLabel="Nueva devolución"
      draftTitle="Nueva devolución"
      draftNote="La maqueta no crea la devolución."
      searchId="devoluciones-buscar"
      statusId="devoluciones-estado"
      draftId="nueva-devolucion"
      emptyLabel="Ninguna devolución coincide."
      statusOptions={previewReturnStatusOptions}
    />
  );
}
