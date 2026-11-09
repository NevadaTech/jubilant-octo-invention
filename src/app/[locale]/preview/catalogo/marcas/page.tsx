import { previewScreens } from "@/modules/preview";
import { CatalogNameList } from "@/modules/preview/presentation/catalogo/catalog-name-list";

const marcas = [{ name: "Nevada", detail: "3 productos" }] as const;

export default function MarcasPreviewPage() {
  return (
    <CatalogNameList
      title={previewScreens.marcas.label}
      actionLabel="Nueva marca"
      items={marcas}
    />
  );
}
