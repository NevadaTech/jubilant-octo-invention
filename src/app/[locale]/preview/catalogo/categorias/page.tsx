import { previewScreens } from "@/modules/preview";
import { CatalogNameList } from "@/modules/preview/presentation/catalogo/catalog-name-list";

const categorias = [
  { name: "Cables", detail: "42 productos" },
  { name: "Audio", detail: "18 productos" },
  { name: "Combos", detail: "6 productos" },
] as const;

export default function CategoriasPreviewPage() {
  return (
    <CatalogNameList
      title={previewScreens.categorias.label}
      actionLabel="Nueva categoría"
      context="Marcas y Combos usan esta misma lista."
      items={categorias}
    />
  );
}
